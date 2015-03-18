/**
**  bfm.js - BrainFuck Macro
**      License: WTFPL
**
**  Original bfmacro page for reference:
**  http://www.cs.tufts.edu/~couch/bfmacro/bfmacro/
**/

var fs = require('fs');

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

BMIR.prototype.toBIR = function BMIR$toBIR(){
	var _bir = new BIR(),
		bir = _bir.root;

	var _allocation_table = new AllocationTable();
	var _macro_table = {}; // macro_name -> [ns, stream...]
	var _at = 0, _loop_base = 0;
	var _loop_stack = [];

	var _parse = function _parse(symbol_table){
		this.forEach(function(a){
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
							if(isNaN(_at)) throw new Error("Invalid use of to() after an unbalanced loop");
							bir[1].push(['move', vs[0]-_at]);
							_at = vs[0];
							return;
						case 'at':
							_at = vs[0];
							return;
						case 'plus':
							bir[1].push(['add', vs[0]]);
							return;
						case 'minus':
							bir[1].push(['add', -vs[0]]);
							return;
						case 'left':
							_at -= vs[0];
							bir[1].push(['move', -vs[0]]);
							return;
						case 'right':
							_at += vs[0];
							bir[1].push(['move', vs[0]]);
							return;
						default:
							if(a[1] in _macro_table){
								var _macro = _macro_table[a[1]];
								if(!_macro) throw new Error("Macro "+a[1]+" not defined");
								if(!_macro[vs.length]) throw new Error("Argument length does not match for "+a[1]);
								_macro = _macro[vs.length];

								var _pv = _macro[0].map(function(c, i){
									var r = (c in symbol_table) ? symbol_table[c] : null;
									symbol_table[c] = vs[i];
									return r;
								});
								_parse.call(_macro[1], symbol_table);
								_macro[0].forEach(function(c, i){
									if(_pv[i] === null) delete symbol_table[c];
									else symbol_table[c] = _pv[i];
								});
								return;
							}else throw new Error("Undefined macro: "+a[1]);
					}
					break;
				case 'define':
					if(!_macro_table[a[1][1]]) _macro_table[a[1][1]] = [];
					_macro_table[a[1][1]][a[1][2].length] = [a[1][2], a[2]];
					return;
				case 'set':
					_allocation_table.setValue(a[1], a[2]);
					return;
				case 'opcode':
					var i, e;
					for(i=0; i<a[1].length; i++){
						switch(a[1][i]){
							case '>': _at++; bir[1].push(['move', 1]); break;
							case '<': _at--; bir[1].push(['move', -1]); break;
							case '+': bir[1].push(['add', 1]); break;
							case '-': bir[1].push(['add', -1]); break;
							case ',': bir[1].push(['read']); break;
							case '.': bir[1].push(['write']); break;
							case '[':
								_loop_stack.push(_loop_base);
								_loop_base = _at;
								e = ['loop', ['block', [], {'parent': bir}]];
								bir[1].push(e); bir = e[1];
								break;
							case ']':
								if(_loop_base != _at) _at = NaN;
								_loop_base = _loop_stack.pop();
								bir = bir[2].parent;
								break;
						}
					}
					return;
			}
		});
		return;
	};

	this.includes.forEach(function(s){
		_parse.call(_load_lib(s), {});
	});
	
	_parse.call(this.root, {});
	return _bir.optimize();
};

BMIR.prototype.toBrainFuck = function BMIR$toBrainFuck(){
	return this.toBIR().toBrainFuck();
};

BMIR.parse = function BMIR_parse(s){
	var bmir = new BMIR(BFMParser.parser.parse(s));
	return bmir;
};


module.exports = BMIR;
