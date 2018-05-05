const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment');
const credentials = require('./credentials');
const terminal = require('child_process').spawn('bash');

const client = new Twitter(credentials);
const getParams = {
  screen_name: 'nickramsbottom',
  count: 300,
};
const now = moment().format('YYYYMMDD_HHmmss');

client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  if (!error) {
    if (!fs.existsSync(`./${getParams.screen_name}`)) {
      fs.mkdirSync(`./${getParams.screen_name}`);
    }
    fs.appendFile(`./${getParams.screen_name}_${now}.json`, JSON.stringify(tweets), (err) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    console.log(error);
  }
});

terminal.stdout.on('data', data => console.log(`stdout:  + ${data}`));

terminal.on('exit', code => console.log(`child process exited with code   ${code}`));

terminal.stdin.write('git status\n');
terminal.stdin.end();
