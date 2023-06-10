const usersCollection = require('../db').db().collection('users')
const usersCollection = require('../db').db().collection('users')

let Follow = function (followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

// Checking to see if the followed username is a string
Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = "";
  }
};

Follow.prototype.validate = function () {
    // followed username must exist in database
    let followedAccount = 
};

// Create function
Follow.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
  });
};

module.exports = Follow;
