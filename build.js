var fs = require('fs'),
	jison = require('jison');

var parser = new jison.Parser(fs.readFileSync("./grammar/bfm.jison", 'utf-8'));
fs.writeFileSync("./lib/bfm-parser.js", parser.generate(), 'utf-8');
