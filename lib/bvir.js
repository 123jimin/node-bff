/**
**  bvir.js - BrainFuck IR with Variables
**            License: WTFPL
**/

var BIR = require("./bir.js");

var BVIR = function BrainFuckVIR(){
	this.root = [{'name': 'block'}, []];
};

// TODO
BVIR.prototype.optimize = function optimize(disables){
	disables |= {};
	return this;
};

// TODO
BVIR.prototype.toBIR = function toBIR(){
	return null;
};

// TODO
BVIR.parse = function parse(s){
	var ast = [{'name': 'block'}, []],
		cast = ast;
	s.split('\n').forEach(function(line, ln){
		ln++; line = line.trim();
		var m = line.match(/([^\s"]+|"([^"\\]|\\.)+")\s?/g);
		if(!m) return;
		m = Array.prototype.map.call(m, function(x){
			return x.trim();
		}).filter(function(x){return x.length;}).map(function(x, i){
			if(i == 0) return x;
			if(x[0] == "'") x = String.fromCharCode(x[1]);
			else if(/^[0-9]+$/.test(x)) x = parseInt(x, 10);

			if(typeof x == 'number')
				return ({'name': 'const', 'value': x});
			else if(x[0] == '"')
				return ({'name': 'string', 'value': x.slice(1,-1).replace(/\\(.)/g, "$1")});
			else
				return ({'name': 'ident', 'value': x});
		});
		if(m.length == 0) return;
		
		var emsg_args = "Syntax error (invalid number of arguments for "+m[0].toUpperCase()+") in line "+ln+": "+line;
	});
	var vir = new BVIR();
	return vir;
};

module.exports = BVIR;
