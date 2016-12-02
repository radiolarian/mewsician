// server data handling methods

Meteor.methods({

  // HEALTH
  refreshHealth(id) {
    Meteor.users.update(id,
      {$set: {"profile.healthLastUpdated": Date.now(),
        "profile.health": 100}}
    );
  },
  updateHealth(id, health) {
    Meteor.users.update(id,
      {$set: {"profile.health": health}}
    );
  },


  // FISH
  addFish(id, fish) {
    Meteor.users.update(id,
      {$inc: {"profile.fish": fish }}
    );
  },
  spendFish(id, fish) {
    Meteor.users.update(id,
      {$dec: {"profile.fish": fish }}
    );
  },


  // FILES
  renameFile(id, name) {
    if (Music.findOne(id))
      Music.update(id,
        {$set: {name: name}}
      );
  },
  removeFile(id) {
    if (Music.findOne(id)) {
      //Music.deCloud(id); // for some reason this deletes all data in the database, which is not good.
      Music.remove(id);
    }
  },


  // MESSAGES
  addMessage(from, group, body) {
    Messages.insert({
      author: from.emails[0].address,
      time: Date.now(),
      fid: from._id,
      group: group,
      body: body,
    });
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
