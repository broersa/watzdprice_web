var config = require('config');
var express = require('express');
var mustacheExpress = require('mustache-express');
var watzdpriceApi = require('./dal/watzdpriceApi.js');
var MyError = require('./MyError.js');
var favicon = require('express-favicon');

watzdpriceApi.init(config.watzdprice_web_api_url, config.watzdprice_web_api_key);

var app = express();

app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/html');

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, next) {
  if (!req.query.q) {
    return res.render('master', {
      title: 'Home | watzdprice.nl',
      homepage: {
        items: []
      }
    });
  } else {
    watzdpriceApi.searchProducts(0,20,req.query.q, function (err, result) {
      if (err) {
        return next(new MyError('ERROR', 'home', 'Error', {q: req.query.q}, err));
      }
      for (var i = 0; i < result.products.length; i++) {
        result.products[i].price = Number(result.products[i].price).toFixed(2);
      }
      return res.render('master', {
        title: req.query.q + ' | watzdprice.nl',
        q: req.query.q,
        searchresults: {
          items: result.products
        }
      });
    });
  }
});

app.get('/product/:id', function(req, res, next) {
  if (req.params.id) {
    watzdpriceApi.getProduct(req.params.id, function (err, result) {
      if (err) {
        return next(new MyError('ERROR', 'product', 'Error', {q: req.params.id}, err));
      }
      if (!result) {
        return next();
      }
      result.price=Number(result.price).toFixed(2);
      return res.render('master', {
        title: result.name + ' | watzdprice.nl',
        id: req.query.id,
        product: result
      });
    });
  } else {
    return next();
  }
});

app.get('/about', function (req, res, next) {
  return res.render('master', {
    title: 'Over ons | watzdprice.nl',
    about: {
    }
  });
});

app.get('/bot', function (req, res, next) {
  return res.render('master', {
    title: 'Bot | watzdprice.nl',
    bot: {
    }
  });
});


app.get('/autocomplete', function(req, res, next) {
  if (req.query.q) {
    watzdpriceApi.getAutocomplete(req.query.q, function (err, result) {
      if (err) {
        console.error(JSON.stringify(err));
        return res.status(200).end(JSON.stringify({ w: [] }));
      }
      return res.status(200).end(JSON.stringify({ w: result }));
    });
  } else {
    return res.status(200).end(JSON.stringify({ w: [] }));
  }
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
      res.render('master', {
        title: 'Pagina niet gevonden... | watzdprice.nl',
        id: req.query.id,
        notfound: {
          url: req.url
        }
      });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

app.use(function (err, req, res, next) {
  console.error(JSON.stringify(err));
  res.status(500).render('master', {
    title: 'Error | watzdprice.nl',
    error: {
      code: err.code,
      message: err.message
    }
  });
})

app.listen(config.watzdprice_web_port);
