// just update the time shown on the page from our chip

import { Posts } from '../imports/posts.js';

Router.route('/', function () {
  this.render('hello');
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
