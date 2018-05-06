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
const tempBackupFile = 'tweets.json';
const dropboxUploadCommand = `./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`;

const getTweets = () => new Promise((resolve, reject) => {
  client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
    if (error) {
      fs.appendFileSync(errorLog, `${error}\n`);
      return reject(error);
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
  .catch((delerr) => {
    fs.appendFileSync(errorLog, `${delerr}\n`);
  }));

  return Promise.all(deletePromises);
};

const backupTweets = tweets => new Promise((resolve, reject) => {
  exec(dropboxUploadCommand, (err, stdout, stderr) => {
    if (err) {
      fs.appendFileSync(errorLog, `${err}\n`);
      reject(err);
    }

    if (stderr) {
      fs.appendFileSync(errorLog, `${stderr}\n`);
      reject(stderr);
    }

    resolve(tweets);
  });
});

const deleteLocalBackup = () => fs.unlinkSync(tempBackupFile);

getTweets()
.then(tweets => saveLocally(tweets))
.then(tweets => backupTweets(tweets))
.then(tweets => deleteTweets(tweets))
.then(() => deleteLocalBackup())
.catch((error) => {
  fs.appendFileSync(errorLog, `${error}\n`);
  throw new Error(error);
});
