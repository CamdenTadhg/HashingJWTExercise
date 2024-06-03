const express = require('express');
const ExpressError = require("../expressError");
const User = require("../models/user");
const Message = require("../models/message");
const SECRET_KEY = require('../config');
const jwt = require('jsonwebtoken');
const {ensureLoggedIn} = require('../middleware/auth');

const router = new express.Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', async (req, res, next) =>{
    const results = await Message.get(req.params.id);
    if (!(req.user.username === results.from_user.username) && !(req.user.username === results.to_user.username)){
        return next(new ExpressError('Unauthorized', 401));
    }
    return res.json({'message': results});
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    const {to_username, body} = req.body;
    const results = await Message.create({from_username: req.user.username, to_username, body});
    return res.json({'message': results});
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', async (req, res, next) => {
    const results = await Message.get(req.params.id);
    if (req.user.username !== results.to_user.username){
        return next (new ExpressError('Unauthorized', 401));
    }
    const results2 = await Message.markRead(req.params.id);
    return res.json({'message': results2});
});

module.exports = router