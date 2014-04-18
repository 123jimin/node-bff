var assert = require('assert'),
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
		it("should line number and column number correctly when un-matched brackets are detected", function(){
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
	var _exec_out_tester = function execute_output_tester(file, output, callback){
		var ir = BFF.parse(files[file]);
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
	describe('execute()', function(){
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
		it("should execute \"Hello, world!\" program correctly", function(done){
			_exec_out_tester("hello-world.1.bf", "Hello World!\n", done);
		});
	});
});
