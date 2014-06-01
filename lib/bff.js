/**
**  bff.js - BrainFuck Framework (main file)
**             License: WTFPL
**/

var BIR = require("./bir.js"),
	BVIR = require("./bvir.js"),
	BI = require("./binterp.js");

var BFF = {
	'BVIR': BVIR,
	'BIR': BIR,
	'BInterp': BI,
	'parse': BIR.parse.bind(BIR)
};

module.exports = BFF;
