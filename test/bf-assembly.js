var assert = require('assert'),
	async = require('async'),
	fs = require('fs');
var BFF = require('../'),
	BInterp = BFF.BInterp;

var files = {};

before(function(done){
	fs.readdir("./test/files/", function(err, list){
		if(err){
			done(err); return;
		}
		(function read_inner(i){
			if(i >= list.length){
				done(); return;
			}
			var file = "./test/files/"+list[i];
			fs.readFile(file, 'utf-8', function(err, data){
				if(err){
					done(err); return;
				}
				files[list[i]] = data;
				read_inner(i+1);
			});
		})(0);
	});
});

describe('BVIR', function(){
	this.timeout(10);
	describe('parse()', function(){

	});
});
