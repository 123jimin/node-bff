var assert = require('assert'),
	fs = require('fs');
var BFF = require('../');

describe('BIR', function(){
	describe('#parse()', function(){
		it('should parse "Hello, world!" programs correctly', function(done){
			fs.readFile("test/files/hello-world.1.bf", 'utf-8', function(err, source){
				var ir = BFF.parse(source);
				if(err){
					done(err); return;
				}
				assert.equal(source.replace(/[^+\-\[\]<>.,#]g/, ''), ir.toBrainFuck());
				done();
			});
		});
	});
});
