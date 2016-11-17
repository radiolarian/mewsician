import { Template } from 'meteor/templating';

var audioTracks = {};

// for the file listing template, array of files

Template.files.onRendered(function() {
  $('input[type="checkbox"]').click(function(){
    $(".debugging").toggle();
  });
});

Template.files.events({
  "click #regenerateKey": () => {
    Meteor.call("regenerateKey", Meteor.userId());
  },
});

Template.files.helpers({
  files() {
    return Music.find({});
  }
});


// handling just a single file

Template.file.helpers({
  link() {
    var file = Music.findOne(this._id);
    if (file) return file.link()
  },

  apikey() {
    var api = ChipAuth.findOne();
    if (api) return api.key;
  }
});

Template.file.events({
  "click .delete": (e) => {
    console.log("clicked", e);
    console.log("clicked", id);
    Meteor.call("removeFile", id);
  },
});

Template.file.onRendered(function() {
  var link;
  var file = Music.findOne(this.data._id);
  console.log("this is ", this);
  console.log("id is ", this.data._id);
  if (file) link = file.link()
  var wavesurfer = WaveSurfer.create({
    container: '#'+this.data._id,
    waveColor: '#c4c9cb',
    cursorColor: '#c4c9cb',
    progressColor: '#43cdf4',
    hideScrollBar: true,
    normalize: true,
    barWidth: 1
  });
  wavesurfer.load(link);
  audioTracks[this.data._id] = wavesurfer;

});

Template.file.events({
  'click .playbutton': function(e) {
    audioTracks[this._id].playPause();
    im = document.getElementById(this._id+"-button");
    if (im.src.includes("images/play.png")) im.src = "images/pause.png";
    else im.src = "images/play.png";
  }});


  // for the uploading form to google cloud

  Template.uploadForm.onCreated(function() {
    this.currentUpload = new ReactiveVar(false);
  });

  Template.uploadForm.helpers({
    currentUpload() {
      return Template.instance().currentUpload.get();
    },
  });

  Template.uploadForm.events({
    'change #fileInput': (e, template) => {
      if (e.currentTarget.files && e.currentTarget.files[0]) {

        // We upload only one file, in case multiple files were selected
        var upload = Music.insert({
          file: e.currentTarget.files[0],
          chunkSize: 'dynamic',
          streams: 'dynamic',
          meta: {
            uid: Meteor.userId(),
            added: Date.now(),
          }}, false);

        upload.on('start', function () {
          template.currentUpload.set(this);
        });

        upload.on('end', function (error, fileObj) {
          if (error) {
            alert('Error during upload: ' + error);
          } else {
            console.log('File "' + fileObj.name + '" successfully uploaded');
          }
          template.currentUpload.set(false);
        });

        upload.start();
      }
    }
  });
