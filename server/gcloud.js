// from https://github.com/VeliovGroup/Meteor-Files/wiki/Google-Cloud-Storage-Integration

var Request = Npm.require('request');
var gcloud = Npm.require('google-cloud')({
  projectId: 'mewsician-148407',
  keyFilename: Meteor.absolutePath + '/gcloud-secret.json'
});

var bucket = gcloud.storage().bucket('mewsician');
bucket.getMetadata((error, metadata, apiResponse) => {
  if (error) console.error(error);
});

var bound = Meteor.bindEnvironment(callback => callback)


// import the file collection for uploads

import { Music } from '../imports/music.js';


// Intercept file's collection remove method to remove file from Google Cloud Storage

var _origRemove = Music.remove;

Music.remove = function(search) {
  var cursor = this.collection.find(search);
  cursor.forEach(function(fileRef) {
    _.each(fileRef.versions, function(vRef) {
      var ref;
      if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0) {
        bucket.deleteFiles(vRef.meta.pipePath, (error) => {
          bound(() => {
            if (error) console.error(error);
          });
        });
      }
    });
  });

  // Call the original removal method
  _origRemove.call(this, search);
};
