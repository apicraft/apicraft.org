var express = require('express');
var lessMiddleware = require('less-middleware');
var fs = require('fs');
var http = require('http');

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


var file = __dirname + '/views/api_model.json';
 
fs.readFile(file, 'utf8', function (err, data) {
  if (err) { console.log('Error: ' + err); return; }
  apipage = JSON.parse(data);
});

app.get('/', function(req, res) {
  res.render('index', { proxyUrl: config.proxyUrl, page: apipage });
});

app.get('/nondev', function(req, res) {
	//load data right off of the api
	http.request({
		host: "api.apicraft.org",
		path: "/conferences/detroit"
	}, function(http_response) {
		var str = '';
	    http_response.on('data', function(d) {
			//collect that stream...
	        str += d;
	    });
		http_response.on('end', function () {
		    //ok, now render the template
			var page_data = JSON.parse(str);
			page_data.footer = {
				"devs": {
					"text": "Developers",
					"link": "/"
				}
			}
			res.render('nondev', { 
				proxyUrl: config.proxyUrl	,  
				page: page_data
				
				});
		  });

	}).end();
	
});


var port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening on port %d', port);
