const router = require('express').Router();
const bookingController = require('../../controllers/booking');
const verifyToken = require('../../middleware/authorization');

// @route POST api/booking/
// @decs CREATE BOOKING/CHECK-IN
// @access Private
router.post('/:book', verifyToken, bookingController.createBooking);

// @route GET api/booking/
// @decs READ ALL BOOKING/CHECK-IN
// @access Private
router.get('/', verifyToken, bookingController.getAllBooking);

// @route GET api/booking/
// @decs READ 1 BOOKING/CHECK-IN
// @access Private
router.get('/:id', verifyToken, bookingController.getBookingById);

// @route PUT api/booking/
// @decs UPDATE booking
// @access Private
router.put(`/update/:id`, verifyToken, bookingController.updateBooking);

// @route PUT api/booking/
// @decs CHANGE ROOM
// @access Private
router.put(
  `/change-room/:bookingID/:roomChooseID/:roomChangeID`,
  verifyToken,
  bookingController.changeRoom
);

// @route PUT api/booking/
// @decs CANCELLED BOOKING
// @access Private
router.put(
  `/cancelled/:bookingID`,
  verifyToken,
  bookingController.cancelBooking
);

module.exports = router;
