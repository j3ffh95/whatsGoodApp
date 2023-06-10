let Follow = function () {};

Follow.prototype.cleanUp = function () {};

Follow.prototype.validate = function () {};

// Create function
Follow.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
  });
};

module.exports = Follow;
