// just update the time shown on the page from our chip

import { Posts } from '../imports/posts';
import { Music } from '../imports/music';

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

    action () {
      // time stamp all incoming data
      data = this.request.body;
      data.time = Date.now();
      Posts.insert(data);

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    },
  });

  // handle uploading media files over api into Google cloud storage

  this.route('upload', {
    path: '/upload/',
    where: 'server',

    action () {
      data = this.request.body;

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    },
  });

  // downloading your media

  this.route('media', {
    path: '/media/',
    where: 'server',

    action () {
      data = this.request.body;
      console.log(data)

      // redirect to the real dl link
      // todo!!!

      // respond saying successful post
      this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      this.response.end();
    },
  });
});
