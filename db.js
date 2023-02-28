// This is the dotenv package use to create environmental varibles
const dotenv = require("dotenv");
dotenv.config();
// This mongodb package is to connect to the mongodb database
const { MongoClient } = require("mongodb");

// we assign the mongoclient to a client variable using the connectionstring given to us
// by Mongo DB
const client = new MongoClient(process.env.CONNECTIONSTRING);

// created a start function to call and make the connection - using async/await
// because we dont know how long is it going to take to connect
async function start() {
  await client.connect();
  // we export from this file the client obj
  module.exports = client;
  // we start our server when we first make a connection to MongoDB
  const app = require("./app");
  app.listen(process.env.PORT);
}

// Start the application
start();
