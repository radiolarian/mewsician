// function split into import file for modularity

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

// code to run on server at startup

Meteor.startup(() => {});

// Hold generated user API keys for file upload

APIKeys = new Mongo.Collection('apikeys');
  /* schema:
   * - user
   * - key
   **/

// publishing server data (authentication)

Meteor.publish("apikeys", function(){
  return APIKeys.find({user: this.userId})
});
