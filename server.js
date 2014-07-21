var express = require('express');
var lessMiddleware = require('less-middleware');
var fs = require('fs');
var http = require('http');
var url = require('url');

var config = require('./config');
var api_model = __dirname + '/views/api_model.json';
var apipage = {};

var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(lessMiddleware({
  src      : __dirname + '/public',
  compress : true
}));
/*
app.use(function(req, res, next) {
if(req.url.substr(-1) == '/' && req.url.length > 1)
res.redirect(301, req.url.slice(0, -1));
else
next();
});
*/
app.use(express.static(__dirname + '/public'));



fs.readFile(api_model, 'utf8', function (err, data) {
  if (err) { console.log('Error: ' + err); return; }
  apipage = JSON.parse(data);
  console.log(apipage);

  app.get('/', function(req, res) {
    if(req.url === "/"){
      console.log("root");
    }
    res.render('index', { 
      proxyUrl: config.proxyUrl, 
      page: apipage
    });
  });
	
  app.get('/conferences/detroit2014', function(req,res){
    res.status = 301;
    res.redirect('/');
  });
	
  app.get('/conferences/detroit2013', function(req,res){
    res.render('detroit2013recap');
  });
	
  var port = process.env.PORT || 3000;
  app.listen(port);

  console.log('Listening on port %d', port);
});
