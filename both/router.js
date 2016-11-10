// just update the time shown on the page from our chip

import { Posts } from './posts';

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

  // basic api demo to ensure the chip can work with our data
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

});
