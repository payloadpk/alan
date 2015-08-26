var WebSocket = require('ws');
var ws = new WebSocket('wss://ws.chain.com/v2/notifications');
module.exports.blockchain = ws;