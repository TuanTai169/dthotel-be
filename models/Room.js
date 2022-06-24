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
    name: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {
      adult: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
      },
      child: {
        type: Number,
        min: 0,
        max: 3,
      },
    },
    detail: {
      bedRoom: {
        type: Number,
        default: 1,
      },
      bathRoom: {
        type: Number,
        default: 1,
      },
      livingRoom: {
        type: Number,
        default: 0,
      },
      kitchen: {
        type: Number,
        default: 0,
      },
      desc: {
        type: String,
      },
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: 'typeOfRooms',
    },

    bed: {
      single: {
        type: Number,
        default: 1,
      },
      double: {
        type: Number,
        default: 0,
      },
    },
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
    cleaner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
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

module.exports = mongoose.model('rooms', RoomSchema);
