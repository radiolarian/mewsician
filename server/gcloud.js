// from https://github.com/VeliovGroup/Meteor-Files/wiki/Google-Cloud-Storage-Integration

import { Gfiles } from '../imports/gfiles.js';

var gcloud, gcs, bucket, bucketMetadata, bound = {};
gcloud = Npm.require('google-cloud')({
  projectId: process.env.PROJECT_ID || 'meow', // <-- Replace this with your project ID
  keyFilename: Meteor.absolutePath + '/gcloud-secret.json'  // <-- Replace this with the path to your key.json
});

gcs = gcloud.storage();
bucket = gcs.bucket('mewsician'); // <-- Replace this with your bucket name
bucket.getMetadata(function(error, metadata, apiResponse){
  if (error) {
    console.error(error);
  }
});
Request = Npm.require('request');
bound = Meteor.bindEnvironment(function(callback){
  return callback();
});


// Intercept file's collection remove method to remove file from Google Cloud Storage
var _origRemove = Gfiles.remove;

Gfiles.remove = function(search) {
  var cursor = this.collection.find(search);
  cursor.forEach(function(fileRef) {
    _.each(fileRef.versions, function(vRef) {
      var ref;
      if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0) {
        bucket.deleteFiles(vRef.meta.pipePath, function(error) {
          bound(function() {
            if (error) {
              console.error(error);
            }
          });
        });
      }
    });
  });
  // Call the original removal method
  _origRemove.call(this, search);
};
