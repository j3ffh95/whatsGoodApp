const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const app = express();

// We need to create a few configuration options for sessions
let sessionOptions = session({
  secret: "JavaScript is sooooooooo coool",
  // setting the store property so it can store the session obj to mongodb
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  // maxAge is how long the cookie for the session should be valid before
  // it expires. Its measured in miliseconds, one day before the cookie expires
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
});

// here we are telling express to use the sessionOptions and also flash
app.use(sessionOptions);
app.use(flash());

// This code allows us to have the user object available in all our ejs templates
app.use(function (req, res, next) {
  // make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }

  // make user session data available from within view templates
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

// HTML Form submit - let express know to add the suer submitted data into our request object,
// so then we can access it from the request.body
app.use(express.urlencoded({ extended: false }));
// Let express know about sending JSON data
app.use(express.json());

// Let express know we are using the public folder
app.use(express.static("public"));
// Set express views so it could know where to look for it(in the views folder),
// second argument is the name of the folder that has our views,  in this case is "views"
app.set("views", "views");
// Let express know which template system/engine we are going to use
app.set("view engine", "ejs");

// Let our app know to use that new router we set up
app.use("/", router);

module.exports = app;
