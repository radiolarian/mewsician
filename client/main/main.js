// for google cloud file uploads
Meteor.subscribe('files.music.all');

ChipAuth = new Mongo.Collection('chipauth');

Meteor.subscribe("chipauth");

// Meteor.startup(function(){
//   //init audiojs
//   audiojs.events.ready(function() {
//     var as = audiojs.createAll();
//     console.log("init audiojs");
//   });
// })
