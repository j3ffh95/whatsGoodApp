let Follow = function (followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = "";
  }
};

Follow.prototype.validate = function () {};

// Create function
Follow.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
  });
};

module.exports = Follow;
