/* global Invoice */
/* global sails */
/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var wallet = sails.config.coinbase;
var redis = sails.config.redis;
var log = sails.log;
var kue = require('kue');
var WebSocket = require('ws');
var ws = new WebSocket('wss://ws.chain.com/v2/notifications');
var log = sails.log;
var queue = kue.createQueue();

module.exports = {
  new: function (req, res) {
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
    // get the rate from memory
    redis.get(rate, function (err, rateCurrent) {
      if (err) log.error("rateUSD fetch unsuccessful", err);
      var amount = parseFloat(req.body.price) / rateCurrent;
      // create an invoice object
      wallet.createAddress({
        "callback_url": '',
        "label": "first blood"
      }, function (err, newBtcAddress) {
        if (err) log.error(err);
        creatInvoice(newBtcAddress);
      });
      function creatInvoice(newBtcAddress) {
        var btcAddress = newBtcAddress.address;
        var invoice = {
          "price": parseFloat(req.body.price),
          "currency": req.body.currency,
          "rate": rateCurrent,
          "amount": amount,
          "btcAddress": btcAddress
        };
        Invoice.create(invoice).exec(function (err, invoice) {
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
          log.debug("Created invoice: " + invoice.id);
          // respond with the amount
          res.json({
            "invoiceId": invoice.id,
            "amount": invoice.amount,
            "address": btcAddress
          }); 
          // create a object for blockchain address subs   
          var reqWs = {
            type: "address",
            address: btcAddress,
            block_chain: "bitcoin"
          };
          // log BTC address
          log.silly("BTC Address is : " + btcAddress);
          // subscribe to block chain address notifications
          ws.send(JSON.stringify(reqWs));
          ws.on('message', function (ev) {
            // log block chain notification
            var x = (JSON.parse(ev));
            if (x.payload.type === "address") {
              if (x.payload.address === btcAddress) {
                var hash = x.payload.transaction_hash;
                // log transaction hash
                log.silly("Transaction hash : " + x.payload.transaction_hash);
                // create confirmation job in kue
                var job = queue.create('confirmation', {
                  transHash: hash,
                }).priority('high').save(function (err) {
                  if (err) log.error("Kue job error : " + err);
                  else log.silly("Job id : " + job.id)
                });
                queue.process('confirmation', function (job, done) {
                  // create a object for blockchain transaction subs
                  var reqInv = {
                    type: "transaction",
                    transaction_hash: hash,
                    block_chain: "bitcoin"
                  };
                  // subscribe to block chain transaction notifications
                  ws.send(JSON.stringify(reqInv));
                  var receivedConf = 0, invoiceConf = 0, requiredConf = 0;
                  ws.on('message', function (ev) {
                    Invoice.update({ btcAddress: btcAddress }, { transactionId: hash }).exec(function afterwards(err, updated) {
                        if (err) {
                          // handle error here- e.g. `res.serverError(err);`
                          log.error("Invoice update error : " + err)
                          return;
                        }
                      });
                    var y = (JSON.parse(ev));
                    if (y.payload.type === "transaction") {
                      // log received confirmations
                      log.silly("Confirmation received : " + y.payload.transaction.confirmations);
                      receivedConf = y.payload.transaction.confirmations;
                      // find invoice previous and required confirmations
                      Invoice.findOne({ btcAddress: btcAddress }).exec(function findOneCB(err, found) {
                        if (err) {
                          // handle error here- e.g. `res.serverError(err);`
                          log.error("Invoice not found : " + err);
                        }
                        log.silly("Invoice pervious conf : " + found.confirmations);
                        invoiceConf = found.confirmations;
                        requiredConf = found.confirmationSpeed;

                        log.silly("Current inv conf : " + invoiceConf);
                        log.silly("Required inv conf : " + requiredConf);
                        
                        if (receivedConf > invoiceConf) {
                          // update invoice confirmations
                          Invoice.update({ btcAddress: btcAddress }, { confirmations: receivedConf }).exec(function afterwards(err, updated) {
                              if (err) {
                                // handle error here- e.g. `res.serverError(err);`
                                log.error(err);
                                return;
                              }
                              log.silly('Updated invoice confirmations : ' + updated[0].confirmations);
                            });
                        } else if (invoiceConf === requiredConf) {
                          // update invoice status
                          Invoice.update({ btcAddress: btcAddress }, { status: "paid" }).exec(function afterwards(err, updated) {
                              if (err) {
                                // handle error here- e.g. `res.serverError(err);`
                                log.error(err);
                                return;
                              }
                              log.silly("Invoice id " + updated[0].id + " status paid");
                            });                      
                          done();
                        }
                      });
                    }
                  });
                });
              }
            } else {
              {
                // log heartbeat
                log.silly(x.payload);
              }
            }
          });
        });
      }
    });
  }
};