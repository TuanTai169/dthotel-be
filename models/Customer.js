const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    idNumber: {
      type: String,
      unique: true,
    },
    address: {
      type: String,
    },
    numberOfPeople: {
      adult: {
        type: Number,
        min: 1,
      },
      child: {
        type: Number,
        min: 0,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('customers', CustomerSchema);
