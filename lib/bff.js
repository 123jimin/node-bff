/**
**  bff.js - BrainFuck Framework (main file)
**             License: WTFPL
**/

var BIR = require("./bir.js"),
	BMIR = require("./bfm.js"),
	BVIR = require("./bvir.js"),
	BI = require("./binterp.js");

var BFF = {
	'BVIR': BVIR,
	'BMIR': BMIR,
	'BIR': BIR,
	'BInterp': BI,
	'parse': BIR.parse.bind(BIR)
};

module.exports = BFF;
