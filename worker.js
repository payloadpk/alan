var Sails = require('sails');
Sails.load(function(err, sails) {
  var market = require('./worker/market.js');
  // push continuous rate updates to redis
  market.contRate();
  var trans = require('./worker/transactions.js');
  trans.trans();
});
