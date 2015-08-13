/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var coinbase = sails.config.coinbase;
var redis = sails.config.redis;
var log = sails.log;


module.exports = {
  new: function(req, res) {

    log.silly('recieved a new request', req.body);

    // if no price is sent
    if (!req.body.price) {
      // reply with a 400 error saying that 'price' is required
      res.status(400);
      res.json({
        success: false,
        message: "'price' is required."
      });

      // log the failure
      return log.verbose('Invoice unsuccessful', {
        missing: "price",
        path: req.path,
        payload: req.body
      });
    }

    var rate;

    switch (req.body.currency) {
      case 'PKR':
        rate = 'ratePKR';
        break;
      case 'USD':
        rate = 'rateUSD';
        break;
      default:
        rate = 'ratePKR';
    }

    // get the rateUSD from memory
    redis.get('rateUSD', function(err, rateUSD) {
      if (err) log.err("rateUSD fetch unsuccessful", err);
      var amount = parseFloat(req.body.price) / rateUSD;
      // respond with the amount
      res.json({
        "amount": amount
      });
    });


  }
};
