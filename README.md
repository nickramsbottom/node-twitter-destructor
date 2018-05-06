# Node Twitter Destructor
A node version of the [twttr autodestructor](https://github.com/rey/twttr_autodestructor) by [@rey](https://github.com/rey).

This has been tested with node `10.0.0`.

## Getting Going

Once you have cloned the repo you will also need to run: `git submodule update --init --recursive` to clone the [Dropbox Uploader](https://github.com/andreafabrizi/Dropbox-Uploader) submodule.

Run `yarn` or `npm` depending on your package manager to install dependencies.

Configure Dropbox Uploader on the system you are running from. Instructions on the repo [README.md](https://github.com/andreafabrizi/Dropbox-Uploader/blob/master/README.md).

Create a new twitter app [here](https://apps.twitter.com/app/new). Make sure you create access tokens at the bottom of the screen once created.

Create `credentials.js` in the project root and populate it using `credentials-example.js` as a template.

Change `screenName` in `destruct.js` to your twitter username.

## Known Limitations

- The twitter API will only respond with 200 tweets per request. This is the maximum number that will be archived per run.
