import { Template } from 'meteor/templating';

var audioTracks = {};

// for the file listing template

Meteor.startup(function () {

});

Template.files.onRendered(function() {
  $('input[type="checkbox"]').click(function(){
    $(".debugging").toggle();
  });
});

Template.files.helpers({
  files() {
    return Music.find({});
  }
});


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

Template.file.onRendered(function() {
    var link;
    var file = Music.findOne(this.data._id);
    console.log("this is ", this);
    console.log("id is ", this.data._id);
    if (file) link = file.link()
    var wavesurfer = WaveSurfer.create({
        container: '#'+this.data._id,
        waveColor: 'violet',
        progressColor: 'purple'
      });
      wavesurfer.load(link);
      audioTracks[this.data._id] = wavesurfer;

});

Template.file.events({
  'click .playbutton': function(e) { 
      console.log("this is ", this._id); 
      console.log(audioTracks);
      audioTracks[this._id].playPause();
  }
});

Template.files.events({
  "click #regenerateKey": () => {
    Meteor.call("regenerateKey", Meteor.userId());
  },
});

// for the uploading form

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

      //console.log(e.currentTarget.files[0])

      // We upload only one file, in case
      // multiple files were selected
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
