// for google cloud file uploads
Meteor.subscribe('files.music.all');
ChipAuth = new Mongo.Collection('chipauth');
Meteor.subscribe("chipauth");

// session variables (renaming)
Session.setDefault("renaming", null);
