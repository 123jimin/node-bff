/**
**  bff.js - BrainFuck Framework (main file)
**             License: WTFPL
**/

var BIR = require("./bir.js"),
	BI = require("./binterp.js");

var BFF = {
	'BIR': BIR,
	'BInterp': BI,
	'parse': BIR.parse.bind(BIR)
};

module.exports = BFF;
