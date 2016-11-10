import { Template } from 'meteor/templating';
import { Posts } from '../../both/posts.js';

Template.demo.helpers({
  posts() { // time sort the posts and then return
    return Posts.find({}, {sort: {time: -1}});
  },
});
