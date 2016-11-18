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
// this is for handling incoming files from CURL (on CHIP)
// the file data is included using curl's form (-F) fields.

Router.map(function() {

  // handle uploading media files over api into Google cloud storage
  // need to use client API since Music.insert only exposed there.
  this.route('upload', {
    path: '/upload/',
    where: 'server',

    action () {

      let tempfile = this.request.filenames.pop();
      // todo - encode/decode URI components of filenames
      // unsure if this actually needed in the short run
      //console.log(this.request.filenames); // file
      //console.log(this.request.body); // auth, name

      var data = {
        file: tempfile, // file object / upload location
        base: tempfile.split(/[\\/]/).pop(), // basename
        name: this.request.body.name,        // given file
      };

      if (!data && data.file) {
        var err = 'no data given for upload, missing file.';
        this.response.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
        this.response.end(err);
        console.warn(err)
      }

      // authenticate the user from their api token

      var user = {}, that = this;
      user.auth = this.request.body.auth; // CHIP authentication key
      user.id = ChipAuth.find({key: user.auth}).map( u => u.user )[0]; // uploader id
      //user.prof = Meteor.users.findOne(user.chip.user); // account of uploader

      if (!user.id) {
        var err = "unauthorized.";
        this.response.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
        this.response.end(err);
        console.warn(err);
      } else {

        // user authorized, start upload

        console.log("starting upload =====================")
        console.log(data);
        console.log(user);
        Music.addFile(data.file, {
          fileName: data.name,
          type: 'audio/mpeg', // TODO - ways to dynamiclly infer this from the basename?
          meta: {
            added: Date.now(),
            uid: user.id,
          }}, function(err, ref){
            //console.log(ref)
            if (err) {
              that.response.writeHead(503, {'Content-Type': 'application/json; charset=utf-8'});
              that.response.end("internal error.\n" + err.toString());
            } else {
              that.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
              that.response.end("upload complete.");
            }
          }, true);

      },
    },
  });

});

// on the server, forward the form fields so files can be uploaded from the api
// https://github.com/iron-meteor/iron-router/issues/909

if (Meteor.isServer) {
  var Busboy = Npm.require("busboy"),
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
