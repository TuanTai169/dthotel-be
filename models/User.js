const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { userRoles } = require('../config/constants');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    image: {
      src: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: userRoles.Employee.name,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('users', UserSchema);
