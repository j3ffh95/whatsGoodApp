const { post } = require("../router");
const sanitizeHTML = require("sanitize-html");
// require in the post collection from the database
const postsCollection = require("../db").db().collection("posts");
const followsCollection = require("../db").db().collection("follows");
// require in a mongodb package to transform user id into a mongo object ID
const ObjectID = require("mongodb").ObjectId;
const User = require("./User");

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }
  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  // get rid of any bogus properties
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    // using the sanitize package the first parameter is what you want to sanitize
    // second parameter is the configurations you want
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    createdDate: new Date(),
    author: new ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide post content");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    // If there is no errors
    if (!this.errors.length) {
      // save post into database
      postsCollection
        .insertOne(this.data)
        .then(info => {
          // our create function promise is going to resolve with the newly created post id
          resolve(info.insertedId);
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.update = function () {
  // Make this update function return a promise
  return new Promise(async (resolve, reject) => {
    try {
      // Making sure if the post id is a valid Id
      let post = await Post.findSingleById(this.requestedPostId, this.userid);
      // console.log(post);
      if (post.isVisitorOwner) {
        // actually update the db
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    // if there are not validation errors
    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate(
        { _id: new ObjectID(this.requestedPostId) },
        { $set: { title: this.data.title, body: this.data.body } }
      );
      resolve("success");
    } else {
      resolve("failure");
    }
  });
};

// =========================== STATIC METHODS =============================================

Post.reusablePostQuery = function (
  uniqueOperations,
  visitorId,
  finalOperations = []
) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations
      .concat([
        {
          // lookup from another collection
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDocument",
          },
        },
        {
          $project: {
            // 1 means true - to include
            title: 1,
            body: 1,
            createdDate: 1,
            authorId: "$author",
            author: { $arrayElemAt: ["$authorDocument", 0] },
          },
        },
      ])
      .concat(finalOperations);

    let posts = await postsCollection.aggregate(aggOperations).toArray();

    //   Clean up author property in each post object
    posts = posts.map(function (post) {
      // Here we create a isVisitorOwner property and assign it a boolean value
      // to check if the user signed in is the author of the post
      post.isVisitorOwner = post.authorId.equals(visitorId);
      // Get rid of authorId in the post object
      post.authorId = undefined;
      post.author = {
        username: post.author.username,
        // We create a new instance of the User class and since we want the avatar we just applied the method
        // get it from that current object
        avatar: new User(post.author, true).avatar,
      };

      return post;
    });
    resolve(posts);
  });
};

// This Static Method finds a post in the DB
Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }
    // If the posts collection finds the post from the database then it will be assign to the post variable
    // the aggregate method allows us to run different mongodb operations
    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );

    if (posts.length) {
      // console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

// This static method finds all posts by the author ID
Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.delete = function (postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postIdToDelete, currentUserId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
        resolve();
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    // Making sure that incoming searchTerm is a string of text - prevent malicious users from sending a object or other things
    if (typeof searchTerm == "string") {
      // Perform database operation
      let posts = await Post.reusablePostQuery(
        [{ $match: { $text: { $search: searchTerm } } }],
        undefined,
        [{ $sort: { score: { $meta: "textScore" } } }]
      );
      resolve(posts);
    } else {
      reject();
    }
  });
};

Post.countPostsByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let postCount = await postsCollection.countDocuments({ author: id });
    resolve(postCount);
  });
};

Post.getFeed = async function (id) {
  // Create an array of the user id's that the current user follows
  let followedUsers = await followsCollection
    .find({ authorId: new ObjectID(id) })
    .toArray();

  // Look for posts where the author is in the above array of followed users
};

module.exports = Post;
