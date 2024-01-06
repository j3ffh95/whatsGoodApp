const apiRouter = require("express").Router();

apiRouter.post("/login", function (req, res) {
  res.json("Logging you in...");
});

module.exports = apiRouter;
