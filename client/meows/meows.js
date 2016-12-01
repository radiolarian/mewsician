Template.mewsages.helpers({
  messages() {
    return Messages.find({}, {sort: {time: -1}});
  },
});

Template.mewsages.events({
  "submit .message": function (e) {
    // get form data
    e.preventDefault()
    const body = $("#msg-text")[0].value;
    console.log(body)

    // TODO - how to specify other users
    // TODO - how to share files w/ them

    // no empty messages please...
    if (body == null || body == "")
      return false;

    Meteor.call("addMessage", Meteor.userId(), "TODO-FIX", body);
    $("#msg-text")[0].value = ""; // reset body
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
