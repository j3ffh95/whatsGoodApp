// requiring the file User model to get access of the User Class
const User = require("../models/User");

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
      req.session.user = { favColor: "blue", username: user.data.username };
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
      req.session.user = { username: user.data.username };
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

exports.home = function (req, res) {
  // Checking to see is there is a user logged in the session obj
  if (req.session.user) {
    // Rendering the home-dashboard template and passing thru a username obj
    // with the current user session username
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    // Render the home-guest template if the user does not exist
    // also passing the errors obj with the errors flash method - the flash package make
    // it easier to delete the errors collection once we called it instead of keeping it in our DB
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("regErrors"),
    });
  }
};
