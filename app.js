// catching up lesson finished 80
// Finished lesson 86

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const markdown = require("marked");
const csrf = require("csurf");
const app = express();
const sanitizeHTML = require("sanitize-html");

// HTML Form submit - let express know to add the suer submitted data into our request object,
// so then we can access it from the request.body
app.use(express.urlencoded({ extended: false }));
// Let express know about sending JSON data
app.use(express.json());

app.use("/api", require("./router-api"));

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
  // Make our markdown function available from within ejs template
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown.parse(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "italic",
        "i",
        "em",
        "h1",
        "h2",
        "h3",
      ],
      allowedAttributes: {},
    });
  };

  // make all errors and success flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // make current user id available on the req object and set it to the property of visitorId
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

// Let express know we are using the public folder
app.use(express.static("public"));
// Set express views so it could know where to look for it(in the views folder),
// second argument is the name of the folder that has our views,  in this case is "views"
app.set("views", "views");
// Let express know which template system/engine we are going to use
app.set("view engine", "ejs");

// Any request that modify state need to have the same csrf token
app.use(csrf());
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Let our app know to use that new router we set up
app.use("/", router);

app.use(function (err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site request forgery detected.");
      req.session.save(() => res.redirect("/"));
    } else {
      res.render("404");
    }
  }
});

// Socket ==============================================================================================================

// Creating a server that is going to use our express app as it's handler
const server = require("http").createServer(app);

const io = require("socket.io")(server);

// express session package to integrate with the socket package
// the function inside is going to run
io.use(function (socket, next) {
  // This code is not worth memorizing because is just making our express session data available
  // from within the context of socket.io
  sessionOptions(socket.request, socket.request.res, next);
});

// Testing to see if the socket connection is working
io.on("connection", function (socket) {
  // Only if you are logged in with user session data
  if (socket.request.session.user) {
    let user = socket.request.session.user;

    socket.emit("welcome", { username: user.username, avatar: user.avatar });

    socket.on("chatMessageFromBrowser", function (data) {
      // Will emit this message to all connected devices except this one
      socket.broadcast.emit("chatMessageFromServer", {
        message: sanitizeHTML(data.message, {
          allowedTags: [],
          allowedAttributes: [],
        }),
        username: user.username,
        avatar: user.avatar,
      });
    });
  }
});

module.exports = server;
