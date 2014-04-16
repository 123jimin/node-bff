/**
**  bff.js - BrainFuck Framework (main file)
**             License: WTFPL
**/

var BIR = require("./bir.js");

var BFF = {
	'BIR': BIR,
	'parse': BIR.parse.bind(BIR)
};

module.exports = BFF;
