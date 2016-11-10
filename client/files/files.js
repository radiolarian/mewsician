import { Template } from 'meteor/templating';

APIKeys = Meteor.subscribe("apikeys");
console.log(APIKeys)

// for the file listing template

Template.files.helpers({
  files() {
    return Music.find({});
  },

  link() {
    return Music.findOne(this._id).link();
  },

  apikey() {
    let api = APIKeys.findOne()
    if (api) return api.key;
  },
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

      // We upload only one file, in case
      // multiple files were selected
      var upload = Music.insert({
        file: e.currentTarget.files[0],
        chunkSize: 'dynamic',
        streams: 'dynamic',
      }, false);

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
