Template.mewsages.helpers({
  messages() {
    return Messages.find({}, {sort: {time: -1}});
  },
});

Template.message.helpers({
  sent() {
    return Meteor.userId() === this.from;
  },

  time() {
    var date = new Date(this.time);
    return date.toLocaleString();
  }
});
