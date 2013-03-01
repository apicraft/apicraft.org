var express = require('express');
var lessMiddleware = require('less-middleware');

/* Yelp stuff!
*******************
var yelp = require("yelp").createClient({
  consumer_key: "5SqpGb9Y-jno81OO-VdJiA", 
  consumer_secret: "J2Xm2uuWMwU_UexGCfg_VC9wznY",
  token: "BPHSv44BV-e2nolQyUs1U1cSjWLxfbca",
  token_secret: "QyRys2UNApDANO8ILK85FqwOOgc"
});

// See http://www.yelp.com/developers/documentation/v2/business
yelp.business("supino-pizzeria-detroit", function(error, data) {
  console.log(data);
});
*/

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
  res.render('index');
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening on port %d', port);
