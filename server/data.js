// server data handling methods

Meteor.methods({
  removeFile(id) {
    if (Music.findOne(id)) {
      //Music.deCloud(id); // for some reason this deletes all data in the database, which is not good.
      Music.remove(id);
    }
  },

  // generating and updating keys for users
  // https://themeteorchef.com/recipes/writing-an-api/
  regenerateKey(uid) {
    if (!Meteor.users.findOne(uid))
      return; // this isnt a real user

    // generate a new auth key for user
    var newKey = Random.hexString(32);

    try {
      var keyId = ChipAuth.upsert(
        { "user": uid },
        { $set: { "key": newKey } }
      );

      return keyId;
    } catch(e) {
      return e;
    }
  },
});
