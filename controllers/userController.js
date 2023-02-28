const User = require("../models/User");

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(function (e) {
      req.flash("errors", e);
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
  let user = new User(req.body);
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Congrats, there are no errors.");
  }
};

exports.home = function (req, res) {
  // Checking to see is there is a user logged in the session obj
  if (req.session.user) {
    // Rendering the home-dashboard template and passing thru a username obj
    // with the current user session username
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    // Render the home-guest template if the user does not exist
    // also passing the errors obj with the errors flash
    res.render("home-guest", { errors: req.flash("errors") });
  }
};
