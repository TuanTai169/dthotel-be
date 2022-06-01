const Booking = require('../models/Booking');

exports.changeStatusBooking = async (bookingId, status, userId) => {
  try {
    const filter = { _id: bookingId };
    const update = { status: status, isDeleted: true };

    updateBooking = await Booking.findByIdAndUpdate(filter, update, {
      new: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
