'use strict';

var moment = require('moment');
var MyError = require('../MyError.js');
var request = require('request');

var url;
var key;

module.exports = {
  init: function(watzdpriceUrl, watzdpriceKey) {
    url = watzdpriceUrl;
    key = watzdpriceKey;
  },
  searchProducts: function (offset, limit, query, cb) {
    var options = {
      uri: url + `/searchproducts?offset=${offset}&limit=${limit}&q=${encodeURIComponent(query)}`,
      headers: {
        accept: 'application/json',
        apikey: key
      }
    }
    request.get(options, function(err, response, body) {
      if (err) {
        return cb(new MyError('ERROR', 'searchProducts', 'Error', {url: url, offset: offset, limit: limit, query: query}, err));
      }
      if (response.statusCode===400) {
        return cb(new MyError('BADREQUEST', 'searchProducts', 'Bad request', {url: url, offset: offset, limit: limit, query: query}, err));
      }
      if (response.statusCode===403) {
        return cb(new MyError('FORBIDDEN', 'searchProducts', 'Forbidden', {url: url, offset: offset, limit: limit, query: query}, err));
      }
      if (response.statusCode===500) {
        return cb(new MyError('ERROR', 'searchProducts', 'Error', {url: url, offset: offset, limit: limit, query: query}, err));
      }
      cb(null, JSON.parse(body));
    });
  }
}
