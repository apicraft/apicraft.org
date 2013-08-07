var express = require('express');
var lessMiddleware = require('less-middleware');
var fs = require('fs');
var http = require('http');
var url = require('url');

var config = require('./config');
var api_model = __dirname + '/conferences/detroit2013/views/api_model.json';
var uberapp = express();
var apipage = {};
var APICraft = {
	"detroit2013": createApp('detroit2013'),
	"detroit2013recap": createApp('detroit2013recap')
}

function createApp(name){
	var app = express();
	app.engine('.html', require('ejs').__express);
	app.set('views', __dirname + '/conferences/'+name+'/views');
	app.set('view engine', 'html');

	app.use(lessMiddleware({
	    src      : __dirname + '/conferences/'+name+'/public',
	    compress : true
	  }));
	
	app.use(function(req, res, next) {
	   if(req.url.substr(-1) == '/' && req.url.length > 1)
	       res.redirect(301, req.url.slice(0, -1));
	   else
	       next();
	});

	app.use(express.static(__dirname + '/conferences/'+name+'/public'));

	return app;
}

fs.readFile(api_model, 'utf8', function (err, data) {
  if (err) { console.log('Error: ' + err); return; }
  apipage = JSON.parse(data);

  	APICraft.detroit2013.get('/', function(req, res) {
  		if(req.url === "/"){
  			console.log("root");
  		}
	  res.render('index', { 
	  	proxyUrl: config.proxyUrl, 
	  	page: apipage, 
	  });
	});

	apipage.name = "API Craft Detroit 2013 Recap";

	APICraft.detroit2013recap.get('/', function(req, res) {
	  res.render('index', { proxyUrl: config.proxyUrl, page: apipage });
	});

	uberapp.enable('strict routing');
	uberapp.all('/conferences/detroit2013', function(req, res) { res.redirect('/conferences/detroit2013/'); });
	uberapp.use('/conferences/detroit2013/',express.static(__dirname+'/public'));

	uberapp
		.use('/conferences/detroit2013/', APICraft.detroit2013)
		.use('/', APICraft.detroit2013recap);

	var port = process.env.PORT || 3000;
	uberapp.listen(port);

	console.log('Listening on port %d', port);
});


