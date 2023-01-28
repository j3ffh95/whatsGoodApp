// It is the routers job to list out all of the URL's routes that we are on the lookout for
const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");

// User related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Export the router to be used in other files
module.exports = router;
