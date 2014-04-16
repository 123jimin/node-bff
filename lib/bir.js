/**
**  bir.js - BrainFuck IR
**     License: WTFPL
**/

// [{'name': ..., ...}, ...]
var BIR = function BrainFuckIR(){
	this.root = [{'name': 'block'}, []];
};

BIR.prototype.optimize = function optimize(disables){
	disables |= {};
	return this;
};

var giveStr = function giveStrFromInt(x, p, n){
	var s = "";
	if(x > 0) while(x-->0) s += p;
	else while(x++<0) s += n;
	return s;
};
var toBF_inner = function toBF(obj){
	var x = obj[1];
	switch(obj[0].name){
		case 'block':
			return x.map(toBF).join('');
		case 'move':
			return giveStr(x, '>', '<');
		case 'add':
			return giveStr(x, '+', '-');
		case 'read':
			return ',';
		case 'write':
			return '.';
		case 'loop':
			return '['+toBF(x)+']';
		case 'debug':
			return '#';
	}
};

BIR.prototype.toBrainFuck = function toBrainFuck(){
	return toBF_inner(this.root);
};

BIR.parse = function parse(s){
	var c, i;
	var ir = new BIR();
	var block_buffer = [];
	var current_block = ir.root;
	var current_elem = null;

	for(i=0, bl=li=1; i<s.length; i++){
		c = s[i];
		switch(c){
			case '<': case '>':
				break;
			case '\n':
				li++; bl=i;
				break;

		}
	}

	return ir;
};

module.exports = BIR;
