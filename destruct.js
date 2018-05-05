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

terminal.stdout.on('data', data => console.log(`stdout: ${data}`));
terminal.stdout.once('data', () => fs.unlinkSync('tweets.json'));
terminal.on('exit', code => console.log(`child process exited with code   ${code}`));

client.get('statuses/user_timeline', getParams, (error, tweets, response) => {
  if (!error) {
    console.log('here');
    fs.appendFileSync('tweets.json', JSON.stringify(tweets));
    terminal.stdin.write(`./Dropbox-Uploader/dropbox_uploader.sh upload ./tweets.json /${getParams.screen_name}_${now}.json\n`);
    terminal.stdin.end();
  } else {
    console.log(error);
  }
});
