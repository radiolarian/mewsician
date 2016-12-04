// just update the time shown on the page from our chip

Router.configure({
  layoutTemplate: "main"
});

Router.route("/", {
  template: "files"
});

Router.route("/demo", {
  template: "demo"
});

Router.route("/meows", {
  template: "mewsages"
});

Router.route("/dress", {
  template: "decorate"
});


// mapping the client route to upload a file automatically.
// this is for handling incoming files from CURL (on CHIP)
// the file data is included using curl's form (-F) fields.
// handle uploading media files over api into Google cloud storage
// need to use client API since Music.insert only exposed there.
Router.map(function () {
  this.route('upload', {
    path: '/upload/',
    where: 'server',
    action () {
      let tempfile = this.request.filenames.pop();
      var data = {
        file: tempfile, // file object / upload location
        base: tempfile.split(/[\\/]/).pop(), // basename
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
        console.log("Starting CURL upload =====================>")
        console.log(data);
        console.log(user);
        Music.addFile(data.file, {
          fileName: data.name,
          type: 'audio/mpeg', // TODO - ways to dynamiclly infer this from the basename?
          meta: {
            added: Date.now(),
            uid: user.id,
          }}, function(err, ref) {
            console.log(ref)
            if (err) {
              that.response.writeHead(503, {'Content-Type': 'application/json; charset=utf-8'});
              that.response.end("internal error.\n" + err.toString());
            } else { // adding fish for gamification, return 200-OK
              try {
                Meteor.call("addFish", user._id, Math.floor(ref.size/100000));
                Meteor.call("refreshHealth", user._id);

              }
              catch(err) { console.error("Error while updating user fish: ", err.toString()); }

              that.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
              that.response.end("upload complete.");
            }
          }, true);
      } }
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

      // Pass filenames to request
      busboy.on("field", function (fieldname, value) { req.body[fieldname] = value; });
      busboy.on("finish", function () { req.filenames = filenames; next(); });
      req.pipe(busboy); // Pass request to busboy

    } else {
      next();
    }
  });
}

