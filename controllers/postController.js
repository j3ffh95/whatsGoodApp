const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = async function (req, res) {
  // assign post to a new instance of the Post model and passed in the form information
  let post = new Post(req.body, req.session.user._id);

  try {
    const newId = await post.create();
    req.flash("success", "New post successfully created.");
    req.session.save(() => res.redirect(`/post/${newId}`));
  } catch (errors) {
    errors.forEach(error => req.flash("errors", error));
    req.session.save(() => res.redirect("/create-post"));
  }

  // post
  //   .create()
  //   .then(function (newId) {
  //     req.flash("success", "New post successfully created.");
  //     req.session.save(() => res.redirect(`/post/${newId}`));
  //   })
  //   .catch(function (errors) {
  //     errors.forEach(error => req.flash("errors", error));
  //     req.session.save(() => res.redirect("/create-post"));
  //   });
};

exports.apiCreate = async function (req, res) {
  // assign post to a new instance of the Post model and passed in the form information
  let post = new Post(req.body, req.apiUser._id);
  try {
    const newId = await post.create();
    res.json("Congrats!");
  } catch (errors) {
    res.json(errors);
  }

  // post
  //   .create()
  //   .then(function (newId) {
  //     res.json("Congrats!");
  //   })
  //   .catch(function (errors) {
  //     res.json(errors);
  //   });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    // console.log(post);
    res.render("single-post-screen", { post: post, title: post.title });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.edit = async function (req, res) {
  // Making a Post instance with the required information to update it
  // with the form body data, the visitor id and also the id of the current post
  let post = new Post(req.body, req.visitorId, req.params.id);

  // USING ASYNC AWAIT INSTEAD OF PROMISE
  // try {
  //   const status = await post.update()
  //   if (status == "success") {
  //     // post was updated in db - create a flash success message
  //     req.flash("success", "Post successfully updated.");
  //     req.session.save(function () {
  //       res.redirect(`/post/${req.params.id}/edit`);
  //     });
  //   } else {
  //     // There was validation errors so we are going to iterate through the errors array
  //     // from the post object and create a flash message for each of them
  //     post.errors.forEach(function (error) {
  //       req.flash("errors", error);
  //     });
  //     // Manually save the session data and redirect them to the same edit page
  //     req.session.save(function () {
  //       res.redirect(`/post/${req.params.id}/edit`);
  //     });
  //   }
  // } catch (errors) {
  //   req.flash("errors", "You do not have permission to perform that action.");
  //     req.session.save(function () {
  //       res.redirect("/");
  //     });
  // }

  post
    .update()
    .then(status => {
      // the post was successfully updated in the database
      // or user did have permission but there were validation errors
      if (status == "success") {
        // post was updated in db - create a flash success message
        req.flash("success", "Post successfully updated.");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        // There was validation errors so we are going to iterate through the errors array
        // from the post object and create a flash message for each of them
        post.errors.forEach(function (error) {
          req.flash("errors", error);
        });
        // Manually save the session data and redirect them to the same edit page
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // a post with the requested id does not exist
      // or if the current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.delete = function (req, res) {
  // pass the id from the current post and also the current visitor
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted.");
      req.session.save(() =>
        res.redirect(`/profile/${req.session.user.username}`)
      );
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    });
};

exports.apiDelete = function (req, res) {
  Post.delete(req.params.id, req.apiUser._id)
    .then(() => {
      res.json("success!");
    })
    .catch(() => {
      res.json("You do not have permission to perform that action");
    });
};

exports.search = function (req, res) {
  // The search function on the Post model is going to return a promise
  Post.search(req.body.searchTerm)
    .then(posts => {
      // Send back a JSON data
      res.json(posts);
    })
    .catch(() => {
      // Sent back an empty array if it fails
      res.json([]);
    });
};
