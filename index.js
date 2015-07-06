var fs = require('fs');
var http = require('http');
var data = fs.readFileSync(__dirname + '/data.txt', 'utf8');

var server = http.createServer(function(req, res) {
  var data = fs.readFileSync(__dirname + '/data.txt', 'utf8');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(data);
  res.end();
});

server.listen(8080);

console.log(data);

console.log('listening on port 8080');