import { Template } from 'meteor/templating';

var audioTracks = {};

// for the file listing template, array of files

Template.files.onRendered(function() {
  $('input[type="checkbox"]').click(function(){
    $(".debugging").toggle();
  });

  $.semanticUiGrowl.defaultOptions = {
    ele: 'body',
    type: 'info',
    offset: {
      from: 'top',
      amount: 20
    },
    align: 'center',
    width: 250,
    delay: 4000,
    allow_dismiss: true,
    stackup_spacing: 10
  };

});

Template.files.events({
  "click #regenerateKey": () => {
    Meteor.call("regenerateKey", Meteor.userId());
  },
});

Template.files.helpers({
  files() {
    return Music.find({}, {sort: {"meta.added": -1}});
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

  renaming() {
    return Session.equals("renaming", this._id)
  },
});



// SINGLE FILE HANDLING

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
  'click .playbutton': function (e) {
    audioTracks[this._id].playPause();
    im = document.getElementById(this._id+"-button");
    if (im.src.includes("images/play.png")) im.src = "images/pause.png";
    else im.src = "images/play.png";
  },

  "click .filename": function (e) { //start rename
    Session.set("renaming", this._id);
  },

  "submit .rename": function (e) { // finish rename
    // get form data
    e.preventDefault()
    const name = $("#filetitle")[0].value;

    // no empty filenames please...
    if (name == null || name == "")
      return false;

    // finish renaming the file
    Session.set("renaming", null);
    Meteor.call("renameFile", this._id, name);
  },

  "blur .rename": function (e) { // loses focus
    Session.set("renaming", null);
  },

  "click .sharing": function(e) {
    var file = Music.findOne(this._id),
      link = file.link(),
      body = `shared music: <a target="_blank" href="${link}">${this.name}</a>`;
    Meteor.call("addMessage", Meteor.user(), "group-id", body);

    $.semanticUiGrowl('Music shared in My Mewsages', {
      header: 'Success'
    });
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




// UPLOADING FILES
//
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
            Meteor.call("refreshHealth", Meteor.userId());
          } catch(err) {
            console.error("Error updating user fish: ", err.toString());
          }
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});
