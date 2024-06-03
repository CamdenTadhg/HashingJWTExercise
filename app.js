/** Express app for message.ly. */
const express = require("express");
const cors = require("cors");
const { authenticateJWT } = require("./middleware/auth");

const ExpressError = require("./expressError")
const app = express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

/** routes */

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") console.error(err.stack);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;

// write integration tests for all other routes
//make a simple front end with registration page, login page, page to see all messages(to and from you), detail page for message, page to make new message with drop-down of users, using AJAX
// send SMS with new message notifying user with Twilio (keep accountSid/authToken secret)
// make an SMS-backed change your password feature
// refactor the classes