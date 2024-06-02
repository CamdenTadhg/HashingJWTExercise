const express = require('express');
const ExpressError = require("../expressError");
const User = require("../models/user");
const SECRET_KEY = require('../config');
const jwt = require('jsonwebtoken');
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");

const router = new express.Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async (req, res, next) =>{
    results = await User.all();
    return res.json({'users': results});
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    results = await User.get(req.params.username);
    return res.json({"user": results});
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async (req, res, next) =>{
    results = await User.messagesTo(req.params.username);
    return res.json({'messages': results});
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {
    results = await User.messagesFrom(req.params.username);
    return res.json({'message': results});
})

module.exports = router