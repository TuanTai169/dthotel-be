const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const verifyToken = require('../../middleware/authorization');
require('dotenv').config();
const authController = require('../../controllers/auth');

//@route GET api/auth
//@desc Check if user is logged in
//@success Public
router.get('/', verifyToken, authController.checkLogin);

// @route POST api/auth/login
// @decs Login user
// @access public
router.post('/login', authController.login);

// @route POST api/auth/register
// @decs Register user
// @access public
router.post('/register', authController.register);

// // @route POST api/auth
// // @decs Forgot Password
// // @access public
router.post('/forgot-password', authController.forgotPassword);

// // @route POST api/auth
// // @decs Reset Password
// // @access public
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
