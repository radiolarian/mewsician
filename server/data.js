Meteor.methods({
  removeFile(id) {
    console.log(id)
    var file = Music.findOne(id)
    console.log(file)
    Music.remove({_id: id});
  },
});
