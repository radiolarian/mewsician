// function split into import file for modularity

import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";


// code to run on server at startup

Meteor.startup(() => {});


// chip authentication code

ChipAuth = new Mongo.Collection("chipauth");

Meteor.publish("chipauth", function() {
  return ChipAuth.find({user: this.userId})
});


// mewsician accessories

Accessories = new Mongo.Collection("accessories");

Meteor.publish("accessories", function() {
  return Accessories.find({user: this.userId})
});


// user-user messages

Messages = new Mongo.Collection("messages");

Meteor.publish("messages", function() {
  return Messages.find({})

  //return Messages.find({$or:
  //[{from: this.userId},
  //{for: this.userId}]
  //});
});
