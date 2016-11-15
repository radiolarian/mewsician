// just update the time shown on the page from our chip

import { Posts } from './posts';

Router.configure({
  layoutTemplate: 'main'
});

Router.route('/', {
  template: 'files'
});

Router.route('/demo', {
  template: 'demo'
});

// handle very simple post requests by dumping into posts mongo collection

Router.map(function () {

  // basic api demo to ensure the chip can work with our data
  this.route('demotime', {
    path: '/demotime/',
    where: 'server',

    action () {
      // time stamp all incoming data
      data = this.request.body;
      data.time = Date.now();
      Posts.insert(data);

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    },
  });

});

// mapping the client route to upload a file automatically.

Router.map(function() {

  // handle uploading media files over api into Google cloud storage
  // need to use client API since Music.insert only exposed there.
  this.route('upload', {
    path: '/upload/',
    where: 'server',

    action () {

      // todo - encode/decode URI components of filenames
      // unsure if this actually needed in the short run

      console.log(this.request.filenames); // file
      console.log(this.request.body.auth); // auth

      //fn.split(/[\\/]/).pop()

      var data = {}; // file + auth
      var auth, file, user, upload;

      if (!data) {
        console.warn('no data given for upload.')
        return this.next();
      } else {
        auth = ChipAuth.findOne({key: data.auth}); // userId of uploader
        if (!auth) return this.next(); // not yet loaded
        user = Meteor.users.findOne(auth.user); // account of uploader
        file = data.file; // local FULL filepath to upload
        //console.log(file)
        //console.log(data)
        //console.log(auth)
        //console.log(user)
      }

      if (!user) {
        console.warn("unauthorized.")
        this.response.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
        this.response.end("unauthorized.");
      } else { // user authorized, upload

          /*
        // We upload only one file, in case
        // multiple files were selected
        getFileObject(file, (f) => {
          console.log(f)

          upload = Music.insert({
            file: f,
            chunkSize: 'dynamic',
            streams: 'dynamic',
            meta: { uid: user._id },
          }, false);

          upload.on('start', function () {
            console.log("starting api upload.")
          });

          upload.on('end', function (error, fileObj) {
            if (error) {
              alert('Error during upload: ' + error);
            } else {
              console.log('File "' + fileObj.name + '" successfully uploaded');
            }
          });

          upload.start(); // try uploading the file!
        });
           * */

      }
    },
  });

});


// on the server, forward the form fields so files can be uploaded from the api
// https://github.com/iron-meteor/iron-router/issues/909

if (Meteor.isServer) {
  var Busboy = Npm.require("Busboy"),
    fs = Npm.require("fs"),
    os = Npm.require("os"),
    path = Npm.require("path");

  Router.onBeforeAction(function (req, res, next) {
    var filenames = []; // Store filenames and then pass them to request.

    // initialize body request
    req.body = req.body || {};

    if (req.method === "POST") {
      var busboy = new Busboy({ headers: req.headers });
      busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join(os.tmpDir(), filename);
        file.pipe(fs.createWriteStream(saveTo));
        filenames.push(saveTo);
      });

      busboy.on("field", function(fieldname, value) {
        req.body[fieldname] = value;
      });

      busboy.on("finish", function () {
        // Pass filenames to request
        req.filenames = filenames;
        next();
      });

      // Pass request to busboy
      req.pipe(busboy);
    } else {
      next();
    }
  });
}
