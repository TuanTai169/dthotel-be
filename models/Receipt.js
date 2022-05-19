const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReceiptSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'bookings',
    },
    detail: {
      type: Object,
    },
    paidOut: {
      type: Number,
      required: true,
      default: 0,
    },
    refund: {
      type: Number,
      required: true,
      default: 0,
    },
    modeOfPayment: {
      type: String,
      default: 'CASH',
    },
    status: {
      type: String,
      default: 'PAID',
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

module.exports = mongoose.model('receipts', ReceiptSchema);
