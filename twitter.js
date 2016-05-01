'use strict';

var _Twitter = require('twitter');
var debug = require('debug')('tweets');

function Twitter() {
  this.client = new _Twitter({
    consumer_key: 'eOxdXfKOX74VZyPXmN7bjFOF6',
    consumer_secret: 'KyvAKE7I2uwpswTEh4GXQT8bk69uG2ohJZIDagE7oZFusrDHtQ',
    access_token_key: '726772957918302212-2RCWVqhCEa0NASUkIcRY0siiAFwiiKE',
    access_token_secret: '4c7VCxrmCq9VN9Vs88Moflz3WYxQDn4xIO1qX15CVUMO4'
  });

  this.hashtag = '';

  this.tweets = [];
  this.followers = 0;

  this.streaming = true;
}

Twitter.prototype.getFollowers = function(cb) {
  var self = this;
  
  // get number of followers at start of camapign
  self.client.get('followers/list', function(error, tweet, response){
    if(error) debug(error);
    cb(tweet.users);
  });
}

Twitter.prototype.track = function(bot, hashtag) {
  var self = this;

  self.hashtag = hashtag;

  bot.say('Enabled tracking for: %s', hashtag);

  self.client.stream('statuses/filter', {track: hashtag}, function(stream) {
    stream.on('data', function(tweet) {
      self.tweets.push({
        user: tweet.user.screen_name, 
        text: tweet.text
      });
      if(self.streaming) {
        bot.say('Tweet by @%s: %s', tweet.user.screen_name, tweet.text);
      }
    });
   
    stream.on('error', function(error) {
      debug(error);
    });
  });

};

Twitter.prototype.start = function(bot, message) {
  var self = this;

  self.client.post('statuses/update', {status: message},  function(error, tweet, response){
    if(error) debug(error);
    debug('sent tweet: %s', tweet);
  });

  bot.say('Tweet sent: %s', message);

  // reset logging for campaign
  self.tweets = [];

  // get users
  self.getFollowers(function(users) {
    self.followers = users.length;
  });
  
};

Twitter.prototype.stream = function(bot, state) {
  this.streaming = state;

  bot.say('Streaming is now set to %s', state);

};

Twitter.prototype.winner = function(bot, count, message) {
  var self = this;


};

Twitter.prototype.stop = function(bot, message) {
  var self = this;

  self.client.post('statuses/update', {status: message},  function(error, tweet, response){
    if(error) throw error;
    debug('sent tweet: %s', tweet);
  });
};

Twitter.prototype.stats = function(bot) {
  var self = this;

  bot.say('Tweets total: %s', self.tweets.length);
  // get users
  self.getFollowers(function(users) {
    bot.say('New Followers: %s', users.length - self.followers);
  });
};

Twitter.prototype.help = function(bot) {
  var self = this;

  bot.say('/track <hashtag>\n' +
               '/start <message>\n' +
               '/stream <on/off>\n' + 
               '/winner <#> <message>\n' +
               '/stop <message>\n' + 
               '/stats\n' +
               '/help\n');

};

module.exports = Twitter;