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

const errorLog = 'error.log';
const tempBackupFile = 'tweets.json';

const logError = (error, reject) => {
  fs.appendFileSync(errorLog, `${error}\n`);
  if (reject) {
    return reject(error);
  }
  return new Error(error);
};

const getTweets = () => new Promise((resolve, reject) => {
  client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
    if (error) {
      logError(error, reject);
    }
    return resolve(tweets);
  });
});

const saveLocally = tweets => new Promise((resolve, reject) => {
  fs.appendFile(tempBackupFile, JSON.stringify(tweets), (err) => {
    if (err) {
      return reject(err);
    }
    return resolve(tweets);
  });
});

const deleteTweets = (tweets) => {
  const deletePromises = tweets.map(tweet => new Promise((resolve, reject) =>
    client.post(`statuses/destroy/${tweet.id_str}`, (err, result, response) => {
      if (err) {
        return reject(err);
      }
      if (!response.statusCode !== '200') {
        return reject(response);
      }
      return resolve();
    }),
  )
  .catch(error => logError(error)));

  return Promise.all(deletePromises);
};

const backupTweets = tweets => new Promise((resolve, reject) => {
  const now = moment().format('YYYYMMDD_HHmmss');
  const dropboxUploadCommand = `./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`;

  exec(dropboxUploadCommand, (err, stdout, stderr) => {
    if (err || stderr) {
      logError(err || stderr, reject);
    }
    resolve(tweets);
  });
});

const deleteLocally = () => fs.unlinkSync(tempBackupFile);

getTweets()
.then(tweets => saveLocally(tweets))
.then(tweets => backupTweets(tweets))
.then(tweets => deleteTweets(tweets))
.then(() => deleteLocally())
.catch(error => logError(error));
