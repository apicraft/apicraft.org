var express = require('express');
var lessMiddleware = require('less-middleware');
var fs = require('fs');

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

var apipage = {
	title: "API Craft Conference",
	footer: {
		devs: {
			text: "Non-Developers",
			link: "/nondev"
		}
	},
	resources: [
		{
			title: "/conferences/{city}",
			verbs: [
				{
					type: "get",
					url: "/conferences",
					description: "List Conferences"
				}
				]
		},
		{
			title: "/goals",
			verbs: [
				{
					type: "get",
					url: "/goals",
					description: "Goals and Philosiphy"
				}
				]
		},
		{
			title: "/questions",
			verbs: [
				{
					type: "post",
					url: "/questions",
					description: "Ask a question"
				},
				{
					type: "get",
					url: "/questions",
					description: "Q's about the event"
				}
				]
		}
		]
}

app.get('/', function(req, res) {
  res.render('index', { proxyUrl: config.proxyUrl, page: apipage });
});

app.get('/nondev', function(req, res) {
  res.render('nondev', { 
	proxyUrl: config.proxyUrl	,  
	page: {
		title: "API Craft Conference - Non Developers",
		footer: {
			devs: {
				text: "Developers",
				link: "/"
			}
		}
	} });
});


var port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening on port %d', port);
