/**
**  bfm.js - BrainFuck Macro
**      License: WTFPL
**
**  Original bfmacro page for reference:
**  http://www.cs.tufts.edu/~couch/bfmacro/bfmacro/
**/

var fs = require('fs');

var _mul_str_cache = {};
var _mul_str = function _mul_str(c, i){
	if(i < 0) return _mul_str(c=='+'?'-':c=='-'?'+':c=='<'?'>':c=='>'?'<':'', -i);
	if(c == '' || i == 0) return '';
	if(i == 1) return c;
	if(c in _mul_str_cache){
		if(i in _mul_str_cache) return _mul_str_cache[i];
	}else _mul_str_cache[c] = ['', c, c+c, c+c+c];
	if(i%2 == 1) return _mul_str_cache[c][i] = _mul_str(c, i-1)+c;
	var s = _mul_str(c, i/2);
	return _mul_str_cache[c][i] = s+s;
};

(function _populate_mul_str_cache(){
	['+','-','<','>'].forEach(function(c){
		for(var i=1; i<20; i++) _mul_str(c, i);
	});
})();


var BIR = require("./bir.js");
var BFMParser = require("./bfm-parser.js");

var BFM_LIB = {};

var _load_lib = function _load_lib(s){
	if(s in BFM_LIB) return BFM_LIB[s];
	if(/[^a-z0-9._\-]$/i.test(s)) return [];
	return BFM_LIB[s] = BFMParser.parser.parse(fs.readFileSync(__dirname+"/bfm-lib/"+s+".bfm", 'utf-8'))[1];
};

var AllocationTable = function AllocationTable(){
	this.table = {}; // A -> 0, B -> 1, ...
	this.table_inv = []; // allocation table
	this.table_min = 0; // min. int. that is unallocated
};

AllocationTable.prototype.setValue = function AllocationTable$setValue(c, v){
	if(c in this.table) delete this.table[c];
	this.table_inv[v] = true;
	this.table[v] = this.table[c] = v;
	while(this.table_inv[this.table_min]) this.table_min++;
	return v;
};

AllocationTable.prototype.getValue = function AllocationTable$getValue(c){
	if((typeof c) !== 'string') return c;
	if(c in this.table) return this.table[c];
	return this.setValue(c, this.table_min);
};

var BMIR = function BrainFuckMIR(data){
	this.includes = data[0];
	this.root = data[1];
};

// TODO
BMIR.prototype.optimize = function BMIR$optimize(_disables){
	var disables = {};
	return this;
};

// TODO: convert to BIR without using BMIR.prototype.toBrainFuck.
BMIR.prototype.toBIR = function BMIR$toBIR(){
	return BIR.parse(this.toBrainFuck());
};

BMIR.prototype.toBrainFuck = function BMIR$toBrainFuck(){
	var _allocation_table = new AllocationTable();
	var _macro_table = {}; // macro_name -> [ns, stream...]
	var _at = 0, _loop_base = 0;
	var _loop_stack = [];

	var _parse = function _parse(symbol_table){
		return this.map(function(a){
			var vs, ret;
			switch(a[0]){
				case 'macro':
					vs = a[2].map(function(s){
						if((typeof s) !== 'string') return s;
						if(s in symbol_table) return symbol_table[s];
						return _allocation_table.getValue(s);
					});
					switch(a[1]){
						case 'to':
							if(isNaN(_at)) throw new Error("Invalid use of to() after an unvalanced loop");
							ret = _mul_str('>', vs[0]-_at);
							_at = vs[0];
							return ret;
						case 'at':
							_at = vs[0];
							return '';
						case 'plus':
							return _mul_str('+', vs[0]);
						case 'minus':
							return _mul_str('-', vs[0]);
						case 'left':
							_at -= vs[0];
							return _mul_str('<', vs[0]);
						case 'right':
							_at += vs[0];
							return _mul_str('>', vs[0]);
						default:
							if(a[1] in _macro_table){
								var _macro = _macro_table[a[1]];
								if(vs.length < _macro[0].length) throw new Error("Too few arguments for "+a[1]);
								var _pv = _macro[0].map(function(c, i){
									var r = (c in symbol_table) ? symbol_table[c] : null;
									symbol_table[c] = vs[i];
									return r;
								});
								ret = _parse.call(_macro[1], symbol_table);
								_macro[0].forEach(function(c, i){
									if(_pv[i] === null) delete symbol_table[c];
									else symbol_table[c] = _pv[i];
								});
								return ret;
							}else throw new Error("Undefined macro: "+a[1]);
					}
					break;
				case 'define':
					_macro_table[a[1][1]] = [a[1][2], a[2]];
					return '';
				case 'set':
					_allocation_table.setValue(a[1], a[2]);
					return '';
				case 'opcode':
					var i, c;
					for(i=0; i<a[1].length; i++){
						c = a[1][i];
						if(c == '>') _at++;
						else if(c == '<') _at--;
						if(c != '[' && c != ']') continue;
						if(c == '['){
							_loop_stack.push(_loop_base);
							_loop_base = _at;
						}else{
							if(_loop_base != _at) _at = NaN;
							_loop_base = _loop_stack.pop();
						}
					}
					return a[1];
			}
		}).join('');
	};

	this.includes.forEach(function(s){
		_parse.call(_load_lib(s), {});
	});
	return _parse.call(this.root, {});
};

BMIR.parse = function BMIR_parse(s){
	var bmir = new BMIR(BFMParser.parser.parse(s));
	return bmir;
};


module.exports = BMIR;
