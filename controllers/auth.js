const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/google-api');
const { appConstant, imageDefault } = require('../config/constants');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //Simple validation
  if (!name || !email || !password)
    return res.status(400).json({
      success: false,
      message: 'Please fill all mandatory fields',
    });
  try {
    //Check for existing email
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        success: false,
        message: 'Email already taken',
      });

    //All good
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: imageDefault,
    });
    await newUser.save();
    //Return Token JWT
    const accessToken = jwt.sign(
      { userId: newUser._id },
      appConstant.accessTokenSecret
    );
    res.json({
      success: true,
      message: 'User created successfully',
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check for existing email
    const user = await User.findOne({ email, isDeleted: false });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect email or password' });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect email or password' });

    //All good
    //Return Token JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      appConstant.accessTokenSecret,
      { expiresIn: appConstant.jwtExpiresIn }
    );

    res.json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkLogin = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password ');

    if (!user)
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal sever error',
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check for existing email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message:
          'Your request could not be processed as entered. Please try again.',
      });

    // Generate the random reset token
    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    user.save(async (err) => {
      if (err)
        return res.status(400).json({
          success: false,
          message: 'Your request could not be processed. Please try again.',
        });
    });

    // Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/admin/reset-password/${resetToken}`;

    const txt = 'Reset your password';

    const message = `
      <div style="max-width: 700px; margin:auto; border: 4px solid #ddd; padding: 50px 20px; font-size: 110%;">
      <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the DT HOTEL</h2>
      <p>Just click the button below to reset your password !</p>
      
      <a href=${resetURL} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
  
      <p>If the button doesn't work for any reason, you can also click on the link below:</p>
  
      <div>${resetURL}</div>
      </div>
  `;

    await sendEmail({
      email: user.email,
      subject: `YOUR PASSWORD RESET TOKEN (valid for 10 min)`,
      message,
    });

    res.json({
      success: true,
      message: 'Please check your email for the link to reset your password.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const token = req.params.token;

  // Validate simple
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: 'You must enter a password.' });
  }
  try {
    const resetUser = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!resetUser)
      return res.status(400).json({
        success: false,
        message:
          'Your token has expired. Please attempt to reset your password again.',
      });

    // ALL GOOD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    resetUser.password = hashedPassword;
    resetUser.resetPasswordToken = '';
    resetUser.resetPasswordExpires = null;

    await resetUser.save();

    res.json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
module.exports = {
  register,
  login,
  checkLogin,
  forgotPassword,
  resetPassword,
};
