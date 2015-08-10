/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var coinbase = sails.config.coinbase;
var redis = sails.config.redis;


module.exports = {
  new: function(req, res) {
    var amount;

    if (!req.body.price && !req.body.currency) {
      res.json({
        success: false,
        error: "Price and currency required"
      });
    }

    amount = parseInt(req.body.price) / (redis.get('ratePKR'));

    btcAccount.createAddress({
      "callback_url": '',
      "label": "first blood"
    }, function(err, newbtcaddress) {
      if (err) console.log(err);

      // the response
      res.json({
        'amount': amount,
        'address': newbtcaddress.address,
      });

    });
  }
};
