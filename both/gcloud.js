Collecitons = {};

Collections.files = new FilesCollection({
  debug: true, // Set to true to enable debugging messages
  throttle: false,
  storagePath: 'assets/app/uploads/uploadedFiles',
  collectionName: 'uploadedFiles',
  allowClientCode: false,
  onAfterUpload: function(fileRef) {
    // In the onAfterUpload callback, we will move the file to Google Cloud Storage
    var self = this;
    _.each(fileRef.versions, function(vRef, version){
      // We use Random.id() instead of real file's _id
      // to secure files from reverse engineering
      // As after viewing this code it will be easy
      // to get access to unlisted and protected files
      var filePath = "files/" + (Random.id()) + "-" + version + "." + fileRef.extension;
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
                // Unlink original files from FS
                // after successful upload to Google Cloud Storage
                self.unlink(self.collection.findOne(fileRef._id), version);
              }
            });
          }
        });
      });
    });
  },
  interceptDownload: function(http, fileRef, version) {
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


