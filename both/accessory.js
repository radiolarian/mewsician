// common (server and client) feed methods

Meteor.methods({

  setAccessory(name, x, y) { // add an accessory for a specific user
      Accessories.upsert({
        user: Meteor.userId(),
        name: name,
        x: x,
        y: y,
      });
    },

  deleteAccessory(id) {
    Accessories.remove({_id: id});
  },

});
