const Post = require("../models/Post");
// requiring the file User model to get access of the User Class
const User = require("../models/User");
const Follow = require("../models/Follow");

exports.sharedProfileData = async function (req, res, next) {
  let isVisitorsProfile = false;
  let isFollowing = false;
  // the profileUser object is from the function ifUserExists.
  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    );
  }

  req.isVisitorsProfile = isVisitorsProfile;
  req.isFollowing = isFollowing;

  // Retrieve post, follower, and following counts
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id);
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id);
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id);
  let [postCount, followerCount, followingCount] = await Promise.all([
    postCountPromise,
    followerCountPromise,
    followingCountPromise,
  ]);

  req.postCount = postCount;
  req.followerCount = followerCount;
  req.followingCount = followingCount;

  next();
};

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action.");
    req.session.save(function () {
      res.redirect("/");
    });
  }
};

// exporting login function
exports.login = function (req, res) {
  // created a user instance with the current session user
  // passed the information of the user trying to log in
  let user = new User(req.body);
  // we called the login function from the User model - it returns a Promise
  user
    .login()
    .then(function (result) {
      // set the session user with and obj that includes username property
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id,
      };
      // manually save the session and redirect to the homepage
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(function (e) {
      // The flash package creates a flash obj in the req - errors is the name of the collection
      // we passed a name for the collection of errors in this case is "errors", and for the
      // second argument we passed the problem that was passed by the Users model file
      req.flash("errors", e);
      // manually saving session obj and then redirecting to homepage
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.register = function (req, res) {
  // when the user is making a account we create a new user instance from the User class
  // we passed the user info to create the instance
  let user = new User(req.body);
  // we called the register function available to us from the User model
  user
    .register()
    .then(() => {
      // made the user session with the user that just register
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(regErrors => {
      // we iterate through the errors array and called the flash method to push each error on the regErrors collection
      regErrors.forEach(function (error) {
        req.flash("regErrors", error);
      });
      // Manually telling session to save
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.home = async function (req, res) {
  // Checking to see is there is a user logged in the session obj
  if (req.session.user) {
    // Fetch feed of posts for current user
    let posts = await Post.getFeed(req.session.user._id);

    // Rendering the home-dashboard template and passing thru a username obj
    // with the current user session username
    res.render("home-dashboard", { posts: posts });
  } else {
    // Render the home-guest template if the user does not exist
    // also passing the errors obj with the errors flash method - the flash package make
    // it easier to delete the errors collection once we called it instead of keeping it in our DB
    res.render("home-guest", { regErrors: req.flash("regErrors") });
  }
};

exports.ifUserExists = function (req, res, next) {
  // The findByUsername is going to return a promise
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      // Here we are going  to set on the req object a profileUser object as the username found
      req.profileUser = userDocument;
      next();
    })
    .catch(function () {
      res.render("404");
    });
};

exports.profilePostsScreen = function (req, res) {
  // Ask our post model for posts by a certain author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      // We are going to use that profileUser object from the req object to pass the username and avatar
      res.render("profile", {
        currentPage: "posts",
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {
          postCount: req.postCount,
          followerCount: req.followerCount,
          followingCount: req.followingCount,
        },
        title: `Profile for ${posts[0].author.username}`,
      });
    })
    .catch(function () {
      res.render("404");
    });
};

exports.profileFollowersScreen = async function (req, res) {
  // The getFollowersById is going to return a promise
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id);

    res.render("profile-followers", {
      currentPage: "followers",
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};

exports.profileFollowingScreen = async function (req, res) {
  // The getFollowingById is going to return a promise
  try {
    let following = await Follow.getFollowingById(req.profileUser._id);

    res.render("profile-following", {
      currentPage: "following",
      following: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};
