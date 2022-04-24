const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConvenienceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
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

module.exports = mongoose.model('conveniences', ConvenienceSchema);
