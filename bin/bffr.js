#!/usr/bin/env node

var fs = require('fs'),
	yargs = require('yargs').demand(2),
	BFF = require('../');

yargs.usage("bffs - BrainFuck Framework\nUsage: $0 run file.bf");

yargs.options('debug', {
	'alias': 'd',
	'describe': "(run) enable debugging feature",
	'default': true,
});

var argv = yargs.argv,
	cmd = argv._.shift(),
	file = argv._.shift();

var bir = null, binterp;
var stdin;

switch(cmd){
	case 'run':
		bir = BFF.parse(fs.readFileSync(file, 'utf-8'));
		binterp = new BFF.BInterp(function(data, callback){
			process.stdout.write(String.fromCharCode.apply(String, data));
			callback();
		});
		binterp.execute(bir, function(err){
			if(err) throw err;
		});
		break;
	default:
		console.log("Unrecognized command: %s", cmd);
}
