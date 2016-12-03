// for google cloud file uploads
Meteor.subscribe("files.music.all");

ChipAuth = new Mongo.Collection("chipauth");
Meteor.subscribe("chipauth");

Messages = new Mongo.Collection("messages");
Meteor.subscribe("messages");

Accessories = new Mongo.Collection("accessories");
Meteor.subscribe("accessories");

// session variables (renaming)
Session.setDefault("renaming", null);
