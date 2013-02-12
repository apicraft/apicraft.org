var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send('<!doctype html><html><body><h1>apicraft.org</h1></body></html>');
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening on port %d', port);
