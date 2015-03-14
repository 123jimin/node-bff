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

describe('BMIR', function(){
	this.timeout(100);
	// actually parse and execute
	describe("parse and execute", function(){
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
