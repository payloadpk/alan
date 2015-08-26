var ws = sails.config.blockchain;
module.exports.trans = function(){
  var log = sails.log;
  ws.on('open', function() {
      ws.send(JSON.stringify({type: 'new-transaction', block_chain: 'bitcoin'}));
  });
  ws.on('message', function(ev) {
    var x = JSON.parse(ev);
    log.silly('New Transaction',x);
  });
};