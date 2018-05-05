const fs = require('fs');
const Twitter = require('twitter');
const credentials = require('./credentials');

const client = new Twitter(credentials);

const params = { screen_name: 'nickramsbottom' };
client.get('statuses/user_timeline', params, (error, tweets, response) => {
  if (!error) {
    console.log(tweets);
    console.log('Success!');
  } else {
    console.log(error);
  }
});
