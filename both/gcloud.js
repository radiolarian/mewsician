// from https://github.com/VeliovGroup/Meteor-Files/wiki/Google-Cloud-Storage-Integration

import { Random } from 'meteor/random'
import { FilesCollection } from 'meteor/ostrio:files';

var gcloud, gcs, bucket, bucketMetadata, Request, bound = {};

if (Meteor.isServer) {
  gcloud = Npm.require('google-cloud')({
    projectId: 'mewsician-148407',
    keyFilename: Meteor.absolutePath + '/gcloud-secret.json'
  });

  gcs = gcloud.storage();
  bucket = gcs.bucket('mewsician-148407.appspot.com');
  bucket.getMetadata(function(error, metadata, apiResponse){
    if (error) {
      console.error(error);
    }
  });
  Request = Npm.require('request');
  bound = Meteor.bindEnvironment(function(callback){
    return callback();
  });
}

// todo: make this nicer, more secure
// https://github.com/VeliovGroup/Meteor-Files/wiki/Constructor

Music = new FilesCollection({
  debug: false, // Set to true to enable debugging messages
  throttle: false,
  storagePath: 'media',
  collectionName: 'music',
  allowClientCode: true,

  onBeforeUpload: function (file) {
    // Allow upload files under 50MB, and only in audio formats [todo: select 1]
    //if (file.size <= 52428800 && /mp3|wav|wma|oggflac/i.test(file.extension)) {
    if (file.size <= 52428800) { // simplify for testing
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  },

  onAfterUpload: function(fileRef, uid) {
    // In the onAfterUpload callback, we will move the file to Google Cloud Storage
    var self = this;
    _.each(fileRef.versions, function(vRef, version){
      // We use Random.id() instead of real file's _id
      // to secure files from reverse engineering
      // As after viewing this code it will be easy
      // to get access to unlisted and protected files
      var filePath = (Random.id()) + "-" + version + "." + fileRef.extension;
      // Here we set the neccesary options to upload the file, for more options, see
      // https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.36.0/storage/bucket?method=upload
      var options = {
        destination: filePath,
        resumable: true
      };

      bucket.upload(fileRef.path, options, function(error, file){
        bound(function(){
          var upd;
          if (error) {
            console.error(error);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
            self.collection.update({
              _id: fileRef._id
            }, upd, function (error) {
              if (error) {
                console.error(error);
              } else {
                // Unlink original files from FS after successful upload to Google Cloud Storage
                self.unlink(self.collection.findOne(fileRef._id), version);
              }
            });
          }
        });
      });
    });
  },

  interceptDownload: function(http, fileRef, version) {
    var self = this;
    var path, ref, ref1, ref2;
    path = (ref= fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipePath : void 0 : void 0 : void 0;
    var vRef = ref1;
    if (path) {
      // If file is moved to Google Cloud Storage
      // We will pipe request to Google Cloud Storage
      // So, original link will stay always secure
      var remoteReadStream = getReadableStream(http, path, vRef);
      self.serve(http, fileRef, vRef, version, remoteReadStream);
      return true;
    } else {
      // While the file has not been uploaded to Google Cloud Storage, we will serve it from the filesystem
      return false;
    }
  }
});

// https://github.com/VeliovGroup/Meteor-Files/wiki/Google-Cloud-Storage-Integration

function getReadableStream(http, path, vRef){
  var array, end, partial, remoteReadStream, reqRange, responseType, start, take;

  if (http.request.headers.range) {
    partial = true;
    array = http.request.headers.range.split(/bytes=([0-9]*)-([0-9]*)/);
    start = parseInt(array[1]);
    end = parseInt(array[2]);
    if (isNaN(end)) {
      end = vRef.size - 1;
    }
    take = end - start;
  } else {
    start = 0;
    end = vRef.size - 1;
    take = vRef.size;
  }

  if (partial || (http.params.query.play && http.params.query.play === 'true')) {
    reqRange = {
      start: start,
      end: end
    };
    if (isNaN(start) && !isNaN(end)) {
      reqRange.start = end - take;
      reqRange.end = end;
    }
    if (!isNaN(start) && isNaN(end)) {
      reqRange.start = start;
      reqRange.end = start + take;
    }
    if ((start + take) >= vRef.size) {
      reqRange.end = vRef.size - 1;
    }
    if ((reqRange.start >= (vRef.size - 1) || reqRange.end > (vRef.size - 1))) {
      responseType = '416';
    } else {
      responseType = '206';
    }
  } else {
    responseType = '200';
  }

  if (responseType === "206") {
    remoteReadStream = bucket.file(path).createReadStream({
      start: reqRange.start,
      end: reqRange.end
    });
  } else if (responseType === "200") {
    remoteReadStream = bucket.file(path).createReadStream();
  }

  return remoteReadStream;
}

if (Meteor.isServer) {
  // Intercept file's collection remove method to remove file from Google Cloud Storage
  var _origRemove = Music.remove;

  Music.remove = function(search) {
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

  // only show the files that they have uploaded for right now
  Meteor.publish('files.music.all', function () {
    // two different for gui vs api uploads
    return Music.find({ $or:
      [{
        userId: this.userId
      },{
        "meta.uid": this.userId
      }]
    }).cursor;
  });
}
