const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment');
const { exec } = require('child_process');
const credentials = require('./credentials');

const client = new Twitter(credentials);
const errorLog = 'error.log';
const tempBackupFile = 'tweets.json';
const now = moment();
const screenName = 'nickramsbottomt';

const logError = (error, reject) => {
  if (reject) {
    return reject(error);
  }
  const errorString = JSON.stringify(error);
  fs.appendFileSync(errorLog, `${errorString}\n`);
  process.exitCode = 1;
  return console.warn('Twitter destructor ecoutered an error, tweets have not been deleted. Check error.log.');
};

const getTweets = () => new Promise((resolve, reject) => {
  const parameters = {
    screen_name: screenName,
    count: 200,
  };

  client.get('statuses/user_timeline', parameters, (error, tweets, response) => {
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
  if (process.exitCode === 1) {
    return null;
  }
  const deletePromises = tweets.map(tweet => new Promise((resolve, reject) =>
    client.post(`statuses/destroy/${tweet.id_str}`, (err, result, response) => {
      if (err || response.statusCode !== 200) {
        logError(err || response);
      }
      return resolve();
    }),
  )
  .catch(error => logError(error)));

  return Promise.all(deletePromises);
};

const backupTweets = tweets => new Promise((resolve, reject) => {
  const dropboxUploadCommand = `./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${screenName}_${now.format('YYYYMMDD_HHmmss')}.json\n`;

  exec(dropboxUploadCommand, (err, stdout, stderr) => {
    if (err || stderr) {
      logError(err || stderr, reject);
    }
    resolve(tweets);
  });
});

const deleteLocally = () => fs.unlinkSync(tempBackupFile);

const updateProfileDescription = tweets => new Promise((resolve, reject) => {
  const parameters = {
    description: `${tweets.length} ${tweets.length === 0 ? 'tweets' : 'tweet'} cleaned on ${now.format('DD/MM/YYYY')}.`,
  };

  client.post('account/update_profile', parameters, (err, result, response) => {
    if (err || response.statusCode !== 200) {
      logError(err || response);
    }

    return resolve(tweets);
  });
});

getTweets()
.then(tweets => saveLocally(tweets))
.then(tweets => backupTweets(tweets))
.then(tweets => deleteTweets(tweets))
.then(tweets => updateProfileDescription(tweets))
.then(() => deleteLocally())
.catch(error => logError(error));
