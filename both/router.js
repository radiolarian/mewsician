// just update the time shown on the page from our chip

import { Posts } from '../imports/posts.js';
import { Files } from '../imports/files.js';

Router.configure({
  layoutTemplate: 'main'
});

Router.route('/', {
  template: 'files'
});

Router.route('/demo', {
  template: 'demo'
});

// handle very simple post requests by dumping into posts mongo collection

Router.map(function () {
  this.route('demotime', {
    path: '/demotime/',
    where: 'server',

    action: function () {
      // time stamp all incoming data
      data = this.request.body;
      data.time = Date.now();
      Posts.insert(data);

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    }
  });
});

// handle uploading media files over api into Google cloud storage

Router.map(function () {
  this.route('upload', {
    path: '/upload/',
    where: 'server',

    action: function () {
      // time stamp all incoming data
      data = this.request.body;
      data.time = Date.now();
      Files.insert(data);

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    }
  });
});

