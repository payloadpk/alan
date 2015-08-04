var redis = require('redis');
var url = require('url');

var redisURL = url.parse("http://localhost:6379");
var client = redis.createClient(6379, "localhost");
//client.auth(redisURL.auth.split(":")[1]);


module.exports.redis = client;