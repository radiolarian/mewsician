import { Template } from 'meteor/templating';

Template.decorate.onRendered(function (){
  // redraw where all the accessories go
  Accessories.find({}).fetch().map(function(a) {
    item = $("." + a.name)[0]
    item.setAttribute('data-x', a.x);
    item.setAttribute('data-y', a.y);
    console.log(a, item)

    item.style.webkitTransform =
      item.style.transform =
      'translate(' + a.x + 'px, ' + a.y + 'px)';
  });

  // target elements with the "draggable" class
  interact('.draggable')
    .draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },

      // enable autoScroll
      autoScroll: true,

      // call this function on every dragmove event
      onmove: dragMoveListener,

      // call this function on every dragend event
      onend: function (event) {
        // var textEl = event.target.querySelector('p');

        // textEl && (textEl.textContent =
        //   'moved a distance of '
        //   + (Math.sqrt(event.dx * event.dx +
        //                event.dy * event.dy)|0) + 'px');
      }
    });

  function dragMoveListener (event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
      item = target.className.split(" ")[0];

    // translate the element
    //console.log('item is ', item);
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    Meteor.call('setAccessory', Meteor.userId(), item, x, y);
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

  //stats stuff
  var hourssince = Math.round((1 -  Math.abs(Date.now() - Meteor.user().profile.healthLastUpdated) / (36e5*72) ) * 100); //0 health at 72 hours elapsed
  console.log("hours since is ", hourssince);
  if (hourssince < 0) hourssince = 0;
  Meteor.call("updateHealth", Meteor.userId(), hourssince);

  $('#health').progress({
    percent:  hourssince
  });
});

Template.decorate.events({
  "click .rad": () => { //radio button
    var radios = document.getElementsByName('bg');
    var bgim =  document.getElementById("catbg");

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        var background = 'images/decorate/' + radios[i].value +'.png'

        // set in the users profile
        Meteor.call("updateBackground", Meteor.userId(), background)

        // set in the image
        bgim.src = background

        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
  },

  "keypress #mName": function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;

    if (keyCode == '13') { // Enter pressed
      var mname = document.getElementById('mName').value;

      if (mname != "" && mname != undefined) {
        Meteor.call("updateMName", Meteor.userId(), mname)
        document.getElementById('mName').value = ""
      }

      return false;
    }
  },
});


// return default or user background

Template.decorate.helpers({
  mBack() {
    return Meteor.user().profile.background || "images/decorate/bg1.png"
  },
});
