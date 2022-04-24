const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const _ = require('lodash');

const { userRoles, imageDefault } = require('../config/constants');

const { userValidation } = require('../tools/validation');
const { uploadImage } = require('../utils/google-api');

const getUser = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }, '-password');
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, phone, address, role, image } = req.body;

  //Validation
  const { error } = userValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  try {
    //Check for existing email
    const emailExist = await User.findOne({ email, isDeleted: false });
    if (emailExist)
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
      phone: phone || '',
      address: address || '',
      role: role || userRoles.Employee.name,
      image: image || imageDefault,
      resetPasswordToken: '',
      resetPasswordExpires: null,
    });
    await newUser.save();

    res.json({
      success: true,
      message: 'User created successfully',
      newUser: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateUser = async (req, res) => {
  const { name, email, phone, address, image, role } = req.body;

  //Simple Validation
  if (!name || !email)
    return res.status(400).json({
      success: false,
      message: 'Name and email are required',
    });

  try {
    let updateUser = {
      name: name,
      email: email,
      phone: phone || '',
      address: address || '',
      image: image || imageDefault,
      role: role,
    };

    const userUpdateCondition = { _id: req.params.id };

    updatedUser = await User.findOneAndUpdate(userUpdateCondition, updateUser, {
      new: true,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  //Simple Validation
  if (!name)
    return res.status(400).json({
      success: false,
      message: 'Name are required',
    });

  try {
    let updateUser = {
      name: name,
      phone: phone,
      address: address,
    };

    const userUpdateCondition = { _id: req.params.id };

    updatedUser = await User.findOneAndUpdate(userUpdateCondition, updateUser, {
      new: true,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'User not found !' });

    const passwordValid = await bcrypt.compare(oldPassword, user.password);
    if (!passwordValid)
      return res.status(400).json({
        success: false,
        message:
          'Incorrect old password ! Please check configuration parameters !',
      });

    if (_.size(newPassword) < 8)
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });

    if (_.isEqual(newPassword, confirmPassword) === false)
      return res.status(400).json({
        success: false,
        message: 'Password did not match',
      });

    //All good
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let updateUser = {
      password: hashedPassword,
    };

    const userUpdateCondition = { _id: userId };

    updatedUser = await User.findOneAndUpdate(userUpdateCondition, updateUser, {
      new: true,
    });

    res.json({
      success: true,
      message: 'Password changed successfully.',
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedUser = await User.findOneAndUpdate(
      userDeleteCondition,
      deleted,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const uploadAvatar = async (req, res) => {
  const userId = req.params.id;
  try {
    const file = req.files.file;

    const urlImg = await uploadImage({
      name: file.name,
      filePath: file.tempFilePath,
    });

    const userUpdateCondition = { _id: userId };
    const updated = {
      image: {
        src: urlImg.webViewLink,
        alt: file.name,
      },
    };

    await User.findOneAndUpdate(userUpdateCondition, updated, {
      new: true,
    });
    res.json({
      success: true,
      message: 'Upload avatar successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  changePassword,
  deleteUser,
  uploadAvatar,
};
