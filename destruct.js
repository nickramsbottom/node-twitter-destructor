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
const dropboxUploadCommand = `./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`;

const deleteTweetPromises = (ids) => {
  const deletePromises = ids.map(id => new Promise((resolve, reject) =>
    client.post(`statuses/destroy/${id}`, (err, result, response) => {
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

  return deletePromises;
};

const dropboxUploadCallback = (err, stdout, stderr, ids) => {
  if (err) {
    fs.appendFileSync(errorLog, `${err}\n`);
    throw new Error(err);
  }

  if (stderr) {
    fs.appendFileSync(errorLog, `${stderr}\n`);
    throw new Error(stderr);
  }

  fs.unlinkSync('tweets.json');

  return Promise.all(deleteTweetPromises(ids));
};


client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  const ids = [];

  if (error) {
    fs.appendFileSync(errorLog, `${error}\n`);
    throw new Error(error);
  }

  if (tweets.length === 0) {
    return;
  }

  tweets.forEach(tweet => ids.push(tweet.id_str));
  fs.appendFileSync('tweets.json', JSON.stringify(tweets));
  exec(dropboxUploadCommand, (err, stdout, stderr) =>
    dropboxUploadCallback(err, stdout, stderr, ids));
});
