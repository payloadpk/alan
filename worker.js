var market = require('./worker/market.js');


// push continuous rate updates to redis
market.contRate();
