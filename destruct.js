const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment');
const credentials = require('./credentials');
const { exec } = require('child_process');

const client = new Twitter(credentials);
const getParams = {
  screen_name: 'nickramsbottom',
  count: 300,
};
const now = moment().format('YYYYMMDD_HHmmss');
const errorLog = 'error.txt';

client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  if (!error) {
    fs.appendFileSync('tweets.json', JSON.stringify(tweets));
    exec(`./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`,
      (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          fs.appendFileSync(errorLog, err);
        }
        if (stderr) {
          console.log('got here?');
        }
        fs.unlinkSync('tweets.json');
      });
  } else {
    console.log(error);
  }
});
