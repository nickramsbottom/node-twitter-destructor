const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment');
const { exec } = require('child_process');
const credentials = require('./credentials');

const client = new Twitter(credentials);
const getParams = {
  screen_name: 'nickramsbottomt',
  count: 200,
};
const now = moment().format('YYYYMMDD_HHmmss');
const errorLog = 'error.log';
const ids = [];

client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  if (!error) {
    if (tweets.length === 0) {
      return;
    }
    tweets.forEach(tweet => ids.push(tweet.id_str));
    fs.appendFileSync('tweets.json', JSON.stringify(tweets));
    exec(`./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`,
      (err, stdout, stderr) => {
        if (err) {
          fs.appendFileSync(errorLog, `${err}\n`);
          throw new Error(err);
        }
        if (stderr) {
          fs.appendFileSync(errorLog, `${stderr}\n`);
          throw new Error(stderr);
        }
        fs.unlinkSync('tweets.json');
        const deletePromises = ids.map(id => new Promise((resolve, reject) => {
          return client.post(`statuses/destroy/${id}`, (delErr, result, res) => {
            if (err) {
              return reject(delErr);
            }
            if (!response.statusCode !== '200') {
              return reject(res);
            }
            return resolve();
          });
        })
        .catch((delerr) => {
          fs.appendFileSync(errorLog, `${delerr}\n`);
        }),
        );
        return Promise.all(deletePromises);
      });
  } else {
    fs.appendFileSync(errorLog, `${error}\n`);
    throw new Error(error);
  }
});
