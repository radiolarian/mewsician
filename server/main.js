import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.publish('files.music.all', function () {
  return Music.find().cursor;
});
