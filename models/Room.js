const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { RoomStatus, imageDefault } = require('../config/constants');

const RoomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      sparse: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {
      adult: {
        type: Number,
        required: true,
      },
      child: {
        type: Number,
      },
    },
    desc: {
      type: String,
    },
    roomType: [
      {
        type: Schema.Types.ObjectId,
        ref: 'typeOfRooms',
      },
    ],
    convenience: [
      {
        type: Schema.Types.ObjectId,
        ref: 'conveniences',
      },
    ],
    status: {
      type: String,
      default: RoomStatus.Ready.name,
    },
    images: [
      {
        type: Object,
        default: imageDefault,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('rooms', RoomSchema);
