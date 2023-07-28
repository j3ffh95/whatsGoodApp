const ObjectID = require("mongodb").ObjectId;

const usersCollection = require("../db").db().collection("users");
const followsCollection = require("../db").db().collection("follows");

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

Follow.prototype.validate = async function (action) {
  // followed username must exist in database
  let followedAccount = await usersCollection.findOne({
    username: this.followedUsername,
  });
  this.authorObj = await usersCollection.findOne({
    _id: new ObjectID(this.authorId),
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push("You cannot follow a user that does not exist.");
  }

  let doesFollowAlreadyExist = await followsCollection.findOne({
    followedId: this.followedId,
    authorId: new ObjectID(this.authorId),
  });

  if (action == "create") {
    if (doesFollowAlreadyExist) {
      this.errors.push("You are already following this user.");
    }
  }

  if (action == "delete") {
    if (!doesFollowAlreadyExist) {
      this.errors.push(
        "You cannot stop following someone you do not already follow."
      );
    }
  }

  // Should not be able to follow yourself
  if (this.followedId.equals(this.authorId)) {
    this.errors.push("You cannot follow yourself.");
  }
};

// Create function
Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();

    await this.validate("create");
    if (!this.errors.length) {
      // Here we are storing a object to the follows collection - the author and user that its going to follow
      await followsCollection.insertOne({
        followedId: this.followedId,
        followedUser: this.followedUsername,
        authorId: new ObjectID(this.authorId),
        authorUser: this.authorObj.username,
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

// Create function
Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();

    await this.validate("delete");
    if (!this.errors.length) {
      // Here we are storing a object to the follows collection - the author and user that its going to follow
      await followsCollection.deleteOne({
        followedId: this.followedId,
        followedUser: this.followedUsername,
        authorId: new ObjectID(this.authorId),
        authorUser: this.authorObj.username,
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function (followedId, visitorId) {
  let followDoc = await followsCollection.findOne({
    followedId: followedId,
    authorId: new ObjectID(visitorId),
  });

  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

module.exports = Follow;
