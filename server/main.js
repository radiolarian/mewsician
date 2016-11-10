// function split into import file for modularity

import { Meteor } from 'meteor/meteor';
import { APIKeys } from '../imports/api';

// code to run on server at startup

Meteor.startup(() => {});

// publishing server data (authentication)

Meteor.publish('apikeys', () => {
  return APIKeys.findOne(this.userId);
});
