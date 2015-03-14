var fs = require('fs');
var files = {};

fs.readdirSync(__dirname).forEach(function(f){
	if(f.slice(-3) == '.js') return;
	files[f] = fs.readFileSync(__dirname+"/"+f, 'utf-8');
});

module.exports = files;
