const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  // assign post to a new instance of the Post model and passed in the form information
  let post = new Post(req.body, req.session.user._id);

  post
    .create()
    .then(function () {
      res.send("new post created");
    })
    .catch(function (errors) {
      res.send(errors);
    });
};
