var Sails = require('sails');
Sails.load(function(err, sails) {
  var market = require('./worker/market.js');
  // push continuous rate updates to redis
  market.contRate();
});
