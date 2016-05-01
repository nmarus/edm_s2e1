'use strict';

var _Twitter = require('twitter');
var debug = require('debug')('tweets');
var _ = require('lodash');

function Twitter() {
  this.client = new _Twitter({
    consumer_key: 'eOxdXfKOX74VZyPXmN7bjFOF6',
    consumer_secret: 'KyvAKE7I2uwpswTEh4GXQT8bk69uG2ohJZIDagE7oZFusrDHtQ',
    access_token_key: '726772957918302212-2RCWVqhCEa0NASUkIcRY0siiAFwiiKE',
    access_token_secret: '4c7VCxrmCq9VN9Vs88Moflz3WYxQDn4xIO1qX15CVUMO4'
  });

  this.handle = 'sparkbot4edm';

  this.hashtag;

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

  if(self.hashtag) message = message + ' ' + self.hashtag;

  self.client.post('statuses/update', {status: message},  function(error, tweet, response){
    if(error) debug(error);
    debug('Tweet sent: %s', message);
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

  // gen rand between 0 and max
  function getRand(max) {
    return Math.floor(Math.random() * max);
  }

  var usersThatTweeted = _.map(self.tweets, 'user');
  debug(usersThatTweeted);

  var usersThatFollow;
  var potentialWinners;

  self.getFollowers(function(users) {
    usersThatFollow = _.map(users, 'screen_name');
    debug(usersThatFollow);

    // remove deuplicates
    potentialWinners = _.uniq(potentialWinners);

    // get users that tweeted AND who follow
    potentialWinners = _.intersection(usersThatTweeted, usersThatFollow);
    debug(potentialWinners);

    // remove self
    potentialWinners = _.difference(potentialWinners, [ self.handle ]);

    var winner_sn;
    for (var i = 0; i < count; i++) {
      winner_sn = potentialWinners[getRand(potentialWinners.length)];
      bot.say('Winner: @%s', winner_sn);
      self.client.post('direct_messages/new', {screen_name: winner_sn, text: message},  function(error, tweet, response){
        if(error) debug(error);
        bot.say('Sent a Direct Message to @%s: %s', winner_sn, message);
      });
    }

  });

};

Twitter.prototype.stop = function(bot, message) {
  var self = this;

  this.streaming = false;

  self.client.post('statuses/update', {status: message},  function(error, tweet, response){
    if(error) debug(error);
    bot.say('Sent Tweet: %s', message);
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