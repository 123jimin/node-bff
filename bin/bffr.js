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
var source = fs.readFileSync(file, 'utf-8');

switch(cmd){
	case 'compile':
		var cur_type = source_type,
			dst_type = argv.dsttype.toLowerCase();
		switch(source_type){
			case 'bfm':
				bir = BFF.BMIR.parse(source);
				break;
			case 'bf':
			default:
				bir = BFF.parse(source);
		}
		switch(source_type){
			case 'bfm':
				bir = bir.toBIR();
			case 'bf':
				if(dst_type == 'bf'){
					console.log(bir.toBrainFuck());
					break;
				}
		}
		break;
	case 'run':
		switch(source_type){
			case 'bfm':
				bir = BFF.BMIR.parse(source).toBIR();
				break;
			case 'bf':
			default:
				bir = BFF.parse(source);
		}

		var eof = false;
		var chunks = [];
		var onRead = null;

		process.stdin.on('data', function(chunk){
			for(var i=0; i<chunk.length; i++) chunks.push(chunk[i]);
			if(onRead){
				onRead();
			}
		});

		process.stdin.on('end', function(){
			eof = true;
			if(onRead){
				onRead();
			}
		});

		binterp = new BFF.BInterp(function(data, callback){
			process.stdout.write(String.fromCharCode.apply(String, data));
			callback();
		}, function(callback){
			if(eof){
				callback(chunks);
				chunks = [];
			}
			else onRead = function(){
				onRead = null;
				callback(chunks);
				chunks = [];
			};
		});
		binterp.execute(bir, function(err){
			if(err) throw err;
		});
		break;
	default:
		console.log("Unrecognized command: %s", cmd);
}
