const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TypeOfRoomSchema = new Schema(
  {
    nameTag: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
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

module.exports = mongoose.model('typeOfRooms', TypeOfRoomSchema);
