const apiRouter = require("express").Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");
const cors = require("cors");

// This makes the api accept all the CORS - Cross Origin Resource Share Policy
apiRouter.use(cors());

apiRouter.post("/login", userController.apiLogin);
apiRouter.post(
  "/create-post",
  userController.apiMustBeLoggedIn,
  postController.apiCreate
);
apiRouter.delete(
  "/post/:id",
  userController.apiMustBeLoggedIn,
  postController.apiDelete
);
apiRouter.get("/postsByAuthor/:username", userController.apiGetPostsByUsername);

module.exports = apiRouter;

// const apiRouter = require("express").Router();
// const userController = require("./controllers/userController");
// const postController = require("./controllers/postController");
// const followController = require("./controllers/followController");

// apiRouter.post("/login", userController.apiLogin);

// module.exports = apiRouter;
