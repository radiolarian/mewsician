// server data handling methods

Meteor.methods({
  removeFile(id) {
    console.log("removing", id)
    var file = Music.findOne(id)
    console.log(file)
    Music.remove({_id: id});
  },
});
