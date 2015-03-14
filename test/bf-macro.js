var assert = require('assert'),
	async = require('async'),
	fs = require('fs');

var BFF = require('../'),
	BMIR = BFF.BMIR,
	BInterp = BFF.BInterp;

var files = require("./files");

var _exec_out_tester = function execute_output_tester(ir, output, callback){
	var _output = "";
	var interp = new BInterp(function(arr, callback){
		_output += String.fromCharCode.apply(String, arr);
		callback();
	});
	interp.execute(ir, function(err){
		if(err){
			callback(err); return;
		}
		try{
			assert.equal(_output, output);
		}catch(e){
			callback(e); return;
		}
		callback();
	});
};

var _bmf_to_bf = function bmf_to_bf(code){
	return BMIR.parse(code).toBrainFuck();
};

describe('BMIR', function(){
	this.timeout(100);
	// actually parse and execute
	describe("parse and execute", function(){
		describe("pointer position", function(){
			it("should compute position of pointers correctly", function(done){
				assert.equal(_bmf_to_bf("V=4;to(X)++to(Y)--<to(V).to(Z),"), "++>--<>>>>.<<,");
				assert.equal(_bmf_to_bf("X=1;>>to(X)plus(4)[to(Y)plus(4)to(X)-]to(Z)."), ">><++++[<++++>-]>.");
				done();
			});
			it("should use at() while computing position of pointers", function(done){
				assert.equal(_bmf_to_bf("X=3;Y=7;to(Y)at(X)to(0)"), ">>>>>>><<<");
				done();
			});
		});
		describe("general excution", function(){
			it("should execute simple program with plus instructions correctly", function(done){
				var source = files["hello.1.bfm"].trim(),
					bmir = BMIR.parse(source);
				_exec_out_tester(bmir.toBIR(), "hello", done);
			});
			it("should execute program computing division operation correctly", function(done){
				var source = files["divide.1.bfm"].trim(),
					bmir = BMIR.parse(source);

				(new BInterp()).execute(bmir.toBIR(), function(err, arr, arr_ptr){
					if(err){
						done(err); return;
					}
					try{
						assert.equal(arr[0], 0);
						assert.equal(arr[1], 0);
						assert.equal(arr[2], 0|47/9);
						assert.equal(arr[3], 47%9);
					}catch(e){
						done(e); return;
					}
					done();
				});
			});
		});
	});
});
