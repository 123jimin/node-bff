/**
**  bir.js - BrainFuck IR
**     License: WTFPL
**/

var BIR = function BrainFuckIR(){
	this.root = ['block', [], null];
};

// TODO
BIR.prototype.optimize = function BIR$optimize(_disables){
	var disables = {};
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
	switch(obj[0]){
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

BIR.prototype.toBrainFuck = function BIR$toBrainFuck(){
	return toBF_inner(this.root);
};

BIR.parse = function BIR_parse(s){
	var c, i, e;
	var ir = new BIR();
	var current_block = ir.root;
	var current_elem = null;

	for(i=0, bl=-1, li=1; i<s.length; i++){
		c = s[i];
		switch(c){
			case '<': case '>':
				if(current_elem && current_elem[0] != 'move'){
					current_block[1].push(current_elem); current_elem = null;
				}
				if(!current_elem) current_elem = ['move', 0];
				current_elem[1] += c == '<' ? -1 : 1;
				break;
			case '+': case '-':
				if(current_elem && current_elem[0] != 'add'){
					current_block[1].push(current_elem); current_elem = null;
				}
				if(!current_elem) current_elem = ['add', 0];
				current_elem[1] += c == '-' ? -1 : 1;
				break;
			case '.': case ',':
				if(current_elem){
					current_block[1].push(current_elem); current_elem = null;
				}
				current_elem = [c == '.' ? 'write' : 'read'];
				break;
			case '#':
				if(current_elem){
					current_block[1].push(current_elem); current_elem = null;
				}
				current_elem = ['debug', {'position': "line "+li+", column "+(i-bl)}];
				break;
			case '[':
				if(current_elem) current_block[1].push(current_elem);
				e = ['loop', ['block', [], {'parent': current_block, 'position': "line "+li+", column "+(i-bl)}]];
				current_block[1].push(e); current_block = e[1]; current_elem = null;
				break;
			case ']':
				if(current_block == ir.root){
					throw new Error("Unmatched closing bracket detected on line "+li+", column "+(i-bl));
				}
				if(current_elem) current_block[1].push(current_elem);
				e = current_block; current_block = e[2].parent;
				delete e[2].position; current_elem = null;
				break;
			case '\n':
				li++; bl=i;
				break;

		}
	}

	if(current_block != ir.root) throw new Error("Unmatched opening bracket detected on "+current_block[2].position);
	if(current_elem) current_block[1].push(current_elem);

	return ir;
};

module.exports = BIR;
