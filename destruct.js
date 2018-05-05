const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment');
const { exec } = require('child_process');
const credentials = require('./credentials');

const client = new Twitter(credentials);
const getParams = {
  screen_name: 'nickramsbottom',
  count: 300,
};
const now = moment().format('YYYYMMDD_HHmmss');
const errorLog = 'error.log';
const ids = [];

client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  if (!error) {
    tweets.forEach(tweet => ids.push(tweet.id));
    fs.appendFileSync('tweets.json', JSON.stringify(tweets));
    exec(`./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`,
      (err, stdout, stderr) => {
        if (err) {
          fs.appendFileSync(errorLog, `${err}\n`);
        }
        if (stderr) {
          fs.appendFileSync(errorLog, `${stderr}\n`);
        }
        fs.unlinkSync('tweets.json');
      });
  } else {
    fs.appendFileSync(errorLog, `${error}\n`);
  }
});
