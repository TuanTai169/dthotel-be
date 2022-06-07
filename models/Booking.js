const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const BookingItemSchema = new Schema(
//   {
//     room: {
//       type: Schema.Types.ObjectId,
//       ref: "rooms",
//     },
//     checkInDate: {
//       type: Date,
//       required: true,
//       default: Date.now,
//     },
//     checkOutDate: {
//       type: Date,
//     },
//     services: [
//       {
//         service: {
//           type: Schema.Types.ObjectId,
//           ref: "services",
//         },
//         quantity: {
//           type: Number,
//           default: 1,
//         },
//       },
//     ],
//     totalOneRoom: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: String,
//       enum: ["NOT PROCESSED", "BOOK", "CHECK IN", "CHECK OUT"],
//       default: "NOT PROCESSED",
//     },
//   },
//   {
//     timestamps: true,
//   }
// )

// module.exports = mongoose.model("bookingItems", BookingItemSchema)

const BookingSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    rooms: [
      {
        room: {
          type: Schema.Types.ObjectId,
          ref: 'rooms',
        },
        checkInDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
        checkOutDate: {
          type: Date,
        },
      },
    ],

    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: 'services',
        },
        amount: {
          type: Number,
        },
      },
    ],
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'services',
        },
        amount: {
          type: Number,
        },
      },
    ],
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'customers',
    },
    deposit: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'coupons',
    },
    earlyCheckIn: {
      type: Number,
      default: 0,
    },
    lateCheckOut: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
    },
    detail: {
      type: Object,
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

module.exports = mongoose.model('bookings', BookingSchema);
