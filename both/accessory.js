// common (server and client) feed methods

Meteor.methods({

  setAccessory(uid, name, x, y) { // add an accessory for a specific user
    console.log(name, x, y);
      Accessories.upsert({
        user: uid,
        name: name,
        x: x,
        y: y
      });
    },

  deleteAccessory(id) {
    Accessories.remove({_id: id});
  },

});
