var express = require('express');
var lessMiddleware = require('less-middleware');
var config = require('./config');

var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(lessMiddleware({
    src      : __dirname + "/public",
    compress : true
  }));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { proxyUrl: config.proxyUrl });
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening on port %d', port);
