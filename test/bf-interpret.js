var assert = require('assert'),
	async = require('async'),
	fs = require('fs');
var BFF = require('../'),
	BInterp = BFF.BInterp;

var files = require('./files');

describe('BIR', function(){
	this.timeout(10);
	describe('parse()', function(){
		it("should parse an empty string or an empty loop correctly", function(){
			assert.equal(BFF.parse("").toBrainFuck(), "");
			assert.equal(BFF.parse("[]").toBrainFuck(), "[]");
		});
		it("should concatenate things like <> and +-", function(){
			assert.equal(BFF.parse("<>").toBrainFuck(), "");
			assert.equal(BFF.parse("+-").toBrainFuck(), "");
			assert.equal(BFF.parse("-+-").toBrainFuck(), "-");
			assert.equal(BFF.parse("<>><").toBrainFuck(), "");
			assert.equal(BFF.parse("++---").toBrainFuck(), "-");
			assert.equal(BFF.parse("><<><>>>").toBrainFuck(), ">>");
		});
		it("should parse \"Hello, world!\" programs correctly", function(){
			var source = files["hello-world.1.bf"].trim(),
				ir = BFF.parse(files["hello-world.1.bf"]);
			assert.equal(ir.toBrainFuck(), source.replace(/[^+\-\[\]<>.,#]g/, ''));
		});
		it("should throw error when the code have un-matched brackets", function(){
			var r_o = /Unmatched opening bracket detected/,
				r_c = /Unmatched closing bracket detected/;
			assert.throws(BFF.parse.bind(BFF, "["), r_o);
			assert.throws(BFF.parse.bind(BFF, "]"), r_c);
			assert.throws(BFF.parse.bind(BFF, "]["), r_c);
			assert.throws(BFF.parse.bind(BFF, "[]]"), r_c);
			assert.throws(BFF.parse.bind(BFF, "[]]["), r_c);
			assert.throws(BFF.parse.bind(BFF, "[[][]"), r_o);
			assert.throws(BFF.parse.bind(BFF, "[[]][[][]"), r_o);
			assert.doesNotThrow(BFF.parse.bind(BFF, "[]"));
			assert.doesNotThrow(BFF.parse.bind(BFF, "[[]]"));
			assert.doesNotThrow(BFF.parse.bind(BFF, "[][]"));
			assert.doesNotThrow(BFF.parse.bind(BFF, "[[][]]"));
			assert.doesNotThrow(BFF.parse.bind(BFF, "[][[]]"));
		});
		it("should give line number and column number correctly when un-matched brackets are detected", function(){
			assert.throws(BFF.parse.bind(BFF, "["), /line 1\, column 1/);
			assert.throws(BFF.parse.bind(BFF, "]"), /line 1\, column 1/);
			assert.throws(BFF.parse.bind(BFF, "[[]"), /line 1\, column 1/);
			assert.throws(BFF.parse.bind(BFF, "[\n["), /line 2\, column 1/);
			assert.throws(BFF.parse.bind(BFF, "asdf["), /line 1\, column 5/);
			assert.throws(BFF.parse.bind(BFF, "hello\nworld]"), /line 2\, column 6/);
			assert.throws(BFF.parse.bind(BFF, "[+]>[[+]"), /line 1\, column 5/);
			assert.throws(BFF.parse.bind(BFF, "[][+[-]][[[+]]\n]+[[]\n[\n][]"), /line 2\, column 3/);
		});
	});
});

describe('BInterp', function(){
	this.timeout(10);
	var _exec_out_tester = function execute_output_tester(src, input, output, callback){
		var ir = BFF.parse(src);
		var _output = "", _input = (typeof input == 'string') ? input.split('').map(function(c){return c.charCodeAt(0);}) : input;
		var interp = new BInterp(function(arr, callback){
			_output += String.fromCharCode.apply(String, arr);
			callback();
		}, function(callback){
			if(_input){
				var __input = _input;
				_input = null;
				callback(__input);
			}else callback([]);
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
	}, _exec_err_tester = function execute_error_tester(src, test_regex, callback){
		(new BInterp()).execute(BFF.parse(src), function(err){
			try{
				assert.ok(err instanceof Error);
				assert.ok(test_regex.test(err.message));
			}catch(e){
				callback(e); return;
			}
			callback();
		});
	};
	var _1024L = "<", _1024R = ">";
	(function(i){
		for(;i<10;i++){
			_1024L += _1024L;
			_1024R += _1024R;
		}
		assert.equal(_1024L.length, 1024);
		assert.equal(_1024R.length, 1024);
	}(0));
	describe('execute()', function(){
		describe('error', function(){
			it("should not allow accessing array with negative index", function(done){
				async.waterfall([
					_exec_err_tester.bind(null, "<+", /negative index/),
					_exec_err_tester.bind(null, ">>-<<<-", /negative index/),
					_exec_err_tester.bind(null, ">+<<+", /negative index/),
					_exec_err_tester.bind(null, "<,", /negative index/),
					_exec_err_tester.bind(null, "<.", /negative index/),
				], done);
			});
		});
		describe('compute', function(){
			it("should calculate 1+1 correctly", function(done){
				(new BInterp()).execute(BFF.parse(">>>++"), function(err, arr, arr_ptr){
					if(err){
						done(err); return;
					}
					try{
						assert.equal(arr_ptr, 3);
						assert.equal(arr[3], 2);
					}catch(e){
						done(e); return;
					}
					done();
				});
			});
			it("should calculate 6*9 correctly", function(done){
				(new BInterp()).execute(BFF.parse("++++++[->+++++++++<]>"), function(err, arr, arr_ptr){
					if(err){
						done(err); return;
					}
					try{
						assert.equal(arr_ptr, 1);
						assert.equal(arr[arr_ptr], 6*9);
					}catch(e){
						done(e); return;
					}
					done();
				});
			});
		});
		describe('print', function(){
			it("should print all 256 characters correctly", function(done){
				for(var s="", i=0; i<256; i++) s += String.fromCharCode(i);
				_exec_out_tester(".+[.+]", null, s, done);
			});
			it("should execute \"Hello, world!\" program correctly", function(done){
				_exec_out_tester(files["hello-world.1.bf"], null, "Hello World!\n", done);
			});
		});
		describe('input', function(){
			it("should input values correctly", function(done){
				_exec_out_tester(",.+.,.-.", "XyZ", "XYyx", done);
			});
			it("should handle EOF correctly", function(done){
				_exec_out_tester(">,[>,]<[<]>[.>]", "Hello, world!\n", "Hello, world!\n", done);
			});
		});
	});
});
