var config = require('config');
var express = require('express');
var mustacheExpress = require('mustache-express');
var watzdpriceApi = require('./dal/watzdpriceApi.js');
var MyError = require('./MyError.js');

watzdpriceApi.init(config.watzdprice_web_api_url, config.watzdprice_web_api_key);

var app = express();

app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/html');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, next) {
  if (req.query.q === undefined) {
    res.render('master', {
      title: 'page title',
      homepage: {
        items: []
      }
    });
  } else {
    watzdpriceApi.searchProducts(0,10,req.query.q, function (err, result) {
      if (err) {
        next(new MyError('ERROR', 'home', 'Error', {q: req.query.q}, err));
      }
      res.render('master', {
        title: 'page title',
        q: req.query.q,
        homepage: {
          items: result.products
        }
      });
    });
  }
});

app.listen(config.watzdprice_web_port);
