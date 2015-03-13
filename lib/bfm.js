/**
**  bfm.js - BrainFuck Macro
**      License: WTFPL
**
**  Original bfmacro page for reference:
**  http://www.cs.tufts.edu/~couch/bfmacro/bfmacro/
**/

var BMIR = function BrainFuckMIR(){
	this.root = [];
};

// TODO
BMIR.prototype.optimize = function BMIR$optimize(disables){
	disables |= {};
	return this;
};

BMIR.prototype.toBIR = function BMIR$toBIR(){
};

BMIR.parse = function BMIR_parse(s){
};

module.exports = BMIR;
