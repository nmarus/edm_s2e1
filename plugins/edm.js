'use strict';

var debug = require('debug')('flint');
var validator = require('validator');
var moment = require('moment');
var Twitter = require('../twitter');

module.exports = function(flint) {

  var twitter = new Twitter();

  flint.on('spawn', function(bot) {
    // debug('new bot spawned in room: %s', bot.myroom.title);
  });
  
  flint.on('despawn', function(bot) {
    // debug('bot despawned in room: %s', bot.myroom.title);
  });
  
  flint.on('message', function(message, bot) {
    // debug('"%s" said "%s" in room "%s"', message.personEmail, message.text, bot.myroom.title);
  });
  
  flint.on('file', function(file, bot) {
    // debug('recieved file "%s"', file.name);
  });
  
  flint.on('error', function(err) {
    debug(err);
  });

  // /test
  flint.hears('/test', function(bot, trigger) {
    bot.say('This is a test message!');
  });


//----------------

  // /track <hashtag>
  flint.hears('/track', function(bot, trigger) {
    if(trigger.args.length > 0) {
      var hashtag = trigger.args[0];

      twitter.track(bot, hashtag);
    } else {
      twitter.help(bot);
      return;
    }
  });

  // /start <message>
  flint.hears('/start', function(bot, trigger) {
    if(trigger.args.length > 0) {
      var message = trigger.message.text.split(' ');
      message.shift();
      message = message.join(' ');

      twitter.start(bot, message);
    } else {
      twitter.help(bot);
      return;
    }
  });

  // /stream <on/off>
  flint.hears('/stream', function(bot, trigger) {
    if(trigger.args.length > 0) {
      var state = trigger.args[0].toLowerCase();
      if(state) {
        if(state === 'on') {
          state = true;

          twitter.stream(bot, state);
        }
        else if(state === 'off') {
          state = false;
          
          twitter.stream(bot, state);
        }
        else {
          twitter.help(bot);
          return;
        }
      }
    } else {
      twitter.help(bot);
      return;
    }

    
  });

  // /winner <#> <message>
  flint.hears('/winner', function(bot, trigger) {
    if(trigger.args.length > 1) {
      var message = trigger.message.text.split(' ');
      message.shift();
      var count = message.shift();
      message = message.join(' ');

      twitter.winner(bot, count, message);
    }
  });

  // /stop <message>
  flint.hears('/stop', function(bot, trigger) {
    if(trigger.args.length > 0) {
      var message = trigger.message.text.split(' ');
      message.shift();
      message = message.join(' ');

      twitter.stop(bot, message);
    }
  });

  // /stats
  flint.hears('/stats', function(bot, trigger) {
    twitter.stats(bot);
  });

  // /help
  flint.hears('/help', function(bot, trigger) {
    twitter.help(bot);
  });

};