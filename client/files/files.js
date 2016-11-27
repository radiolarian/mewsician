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
  },

  apikey() {
    var api = ChipAuth.findOne();
    if (api) return api.key;
  },
});


// handling just a single file

Template.file.helpers({
  link() {
    var file = Music.findOne(this._id);
    if (file) return file.link()
  },

  date() {
    var date = new Date(this.meta.added);
    return date.toLocaleString();
  },
});

Template.file.onRendered(function() {
  var link;
  var file = Music.findOne(this.data._id);
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

  $('.ui.dropdown')
    .dropdown()
  ;

});

Template.file.events({
  'click .playbutton': function(e) {
    audioTracks[this._id].playPause();
    im = document.getElementById(this._id+"-button");
    if (im.src.includes("images/play.png")) im.src = "images/pause.png";
    else im.src = "images/play.png";
  },

  "click .delete": function(e) {
    Meteor.call("removeFile", this._id);
  },
});


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
  'change #fileInput': function (e, template) {
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
        } else { // TODO - remove to avoid rewarding random file uploads.
          console.log('File "' + fileObj.name + '" successfully uploaded');
          try {
            Meteor.call("addFish", Meteor.userId(), Math.round(fileObj.size/100000));
          } catch(err) {
            console.error("Error while updating user fish: ", err.toString());
          }
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});
