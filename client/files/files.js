import { Template } from 'meteor/templating';
import { Music } from '../../imports/music.js';

// for the file listing template

Template.files.helpers({
  files() {
    // time sort the posts and then return
    return Music.find({}, {sort: {time: -1}})
      .map( s => s );
    //.map( s => s.title );
  },
});


// for the uploading form

Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {

      // We upload only one file, in case
      // multiple files were selected
      var upload = Music.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});
