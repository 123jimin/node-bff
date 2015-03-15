#!/usr/bin/env node

var fs = require('fs'),
	yargs = require('yargs').demand(2),
	BFF = require('../');

yargs
	.usage("bffr - BrainFuck Framework\nUsage: $0 <command> [options] <source> ...")
	.command('run', "runs the given source code")
	.command('compile', "compiles/translates the given source code into other languages");

yargs.options('debug', {
	'describe': "enable debugging feature",
	'default': false,
});

yargs.option('srctype', {
	'alias': 's',
	'describe': "specifies the type of the source code (bf, bfm)"
});

yargs.option('dsttype', {
	'alias': 'd',
	'describe': "specifies the type of the destination code (bf, bfm)",
	'default': 'bf'
});

var argv = yargs.argv,
	cmd = argv._.shift(),
	file = argv._.shift();

var source_type = (argv.srctype || file.split('.').pop()).toLowerCase();
if(source_type != 'bfm') source_type = 'bf';

var bir = null, binterp;
var source;
var stdin;

switch(cmd){
	case 'run':
		source = fs.readFileSync(file, 'utf-8');
		switch(source_type){
			case 'bfm':
				bir = BFF.BMIR.parse(source).toBIR();
				break;
			case 'bf':
			default:
				bir = BFF.parse(source);
		}
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
