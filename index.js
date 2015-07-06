var fs = require('fs');

var data = fs.readFileSync(__dirname + '/data.txt', 'utf8');

console.log(data);