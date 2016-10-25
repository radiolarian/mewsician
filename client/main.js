import { Template } from 'meteor/templating';

import { Posts } from '../imports/posts.js';

Template.hello.helpers({
  posts() {
    // time sort the posts and then return
    return Posts.find({}, {sort: {time: -1}});
  },
});

