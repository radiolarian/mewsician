import { Template } from 'meteor/templating';

import { Files } from '../../imports/files.js';

Template.demo.helpers({
  posts() {
    // time sort the posts and then return
    return Files.find({}, {sort: {time: -1}})
      .map( s => s );
      //.map( s => new Date(s).toString() );
  },
});

