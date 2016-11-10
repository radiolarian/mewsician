// Ensuring every user has an email address, should be in server-side code

Accounts.validateNewUser((user) => {
  new SimpleSchema({
    _id: { type: String },
    emails: { type: Array },
    'emails.$': { type: Object },
    'emails.$.address': { type: String },
    'emails.$.verified': { type: Boolean },
    createdAt: { type: Date },
    services: { type: Object, blackbox: true }
  }).validate(user);

  // Return true to allow user creation to proceed
  return true;
});

// generating and updating keys for users
// https://themeteorchef.com/recipes/writing-an-api/

Meteor.methods({
  regenerateApiKey(userId) {
    check(userId, this.userId());
    var newKey = Random.hexString(32);
    try {
      var keyId = APIKeys.upsert({ "owner": userId }, {
        $set: {
          "key": newKey
        }
      });
      return keyId;
    } catch(e) {
      return e;
    }
  },
});
