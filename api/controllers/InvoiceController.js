/* global Invoice */
/* global sails */
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
  new: function (req, res) {

    log.silly('recieved a new request', req.body);

    // if no price is sent
    if (!req.body.price) {
      // reply with a 400 error saying that 'price' is required
      res.status(400);
      res.json({
        success: false,
        message: "'price' is required."
      });

      // log the failure and drop out of the function
      return log.verbose('Invoice unsuccessful', {
        missing: "price",
        path: req.path,
        payload: req.body
      });
    }

    // if no currency is sent, assume it is PKR
    if (!req.body.currency) {
      req.body.currency = "USD";
    }

    var rate;
    // assign rate the value of the currency called
    switch (req.body.currency) {
      case 'USD':
        rate = 'rateUSD';
        break;
      case 'PKR':
        rate = 'ratePKR';
        break;
      default:
        rate = 'ratePKR';
    }

    log.silly(rate);
    // get the rate from memory
    redis.get(rate, function (err, rateCurrent) {
      if (err) log.error("rateUSD fetch unsuccessful", err);
      var amount = parseFloat(req.body.price) / rateCurrent;
      log.silly("RATE CURRENT");
      log.silly(rateCurrent);
      // create an invoice object
      var invoice = {
        "price": parseFloat(req.body.price),
        "currency": req.body.currency,
        "rate": rateCurrent,
        "amount": amount
      };

      // insert the object into the DB
      Invoice.create(invoice).exec(function (err, created) {
        if (err) {
          // log the error
          log.error(err);
          // reply with a 500 error
          res.status(500);
          return res.json({
            success: false,
            message: "Internal server error"
          });
        }
        log.debug("Created invoice: " + created.id);
        // respond with the amount
        res.json({
          "amount": created.amount
        });
      });
    });
  }
};
