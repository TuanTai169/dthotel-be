const Booking = require('../models/Booking');
const toolRoom = require('../tools/roomTool');
const toolService = require('../tools/serviceTool');
const { RoomStatus, BookingStatus } = require('../config/constants');

const createBooking = async (req, res) => {
  const {
    rooms,
    customer,
    checkInDate,
    checkOutDate,
    services,
    products,
    deposit,
    discount,
  } = req.body;

  try {
    // Check booking exist
    const checkStatus = await toolRoom.checkStatusRoom(checkInDate, rooms);

    if (checkStatus === false)
      return res.status(400).json({
        success: false,
        message: 'Room has been booking or occupied on this day',
      });

    //Generate code
    const code = 'DT' + Date.now().toString();

    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(rooms);

    // Calculate price
    let totalRoomCharge;
    let earlyCheckIn = 0;
    let lateCheckOut = 0;
    if (hourDiff < 24) {
      totalRoomCharge = await toolRoom.priceInHour(hourDiff, roomCharge);
    } else {
      const early = await toolRoom.earlyCheckIn(checkInDate, roomCharge);
      const late = await toolRoom.lateCheckOut(checkOutDate, roomCharge);

      earlyCheckIn = early.price;
      lateCheckOut = late.price;
      totalRoomCharge =
        ((hourDiff - early.hour - late.hour) * roomCharge) / 24 +
        earlyCheckIn +
        lateCheckOut;
    }

    // //Calculate service's price
    const serviceCharge = await toolService.calculateServiceCharge(services);

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(discount);

    //Change status
    let status =
      req.params.book === 'check-in'
        ? BookingStatus.checkIn.name
        : BookingStatus.Booking.name;

    //Price
    const VAT = 10;

    const totalPrice = (
      (totalRoomCharge + serviceCharge) *
        (1 + VAT / 100 - discountCharge / 100) -
      deposit
    ).toFixed();

    const roomList = rooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    const newBooking = new Booking({
      code,
      rooms: roomList,
      customer,
      services,
      products,
      deposit,
      discount,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
      status,
    });

    await newBooking.save();

    //Change STATUS ROOM
    const statusOfRoom =
      status === RoomStatus.Booking.name
        ? RoomStatus.Booking.name
        : RoomStatus.Occupied.name;
    await toolRoom.changeStatusArrayRooms(rooms, statusOfRoom);

    res.json({
      success: true,
      message: `${status} successfully`,
      booking: newBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllBooking = async (req, res) => {
  try {
    const bookings = await Booking.find({ isDeleted: false })
      .populate({ path: 'customer', select: 'name email phone' })
      .populate({
        path: 'rooms',
        select: 'roomNumber floor price roomType status',
      })
      .populate({
        path: 'services',
        select: 'name price',
      })
      .populate({
        path: 'discount',
        select: 'code discount desc ',
      })
      .select('-createdAt -updatedAt');
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'customer', select: 'name email phone' })
      .populate({
        path: 'rooms',
        select: 'roomNumber floor price roomType status',
      })
      .populate({
        path: 'services',
        select: 'name price',
      });
    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateBooking = async (req, res) => {
  const {
    rooms,
    customer,
    checkInDate,
    checkOutDate,
    services,
    deposit,
    discount,
    status,
  } = req.body;

  try {
    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    // //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(rooms);

    // Calculate price
    let totalRoomCharge;
    let earlyCheckIn;
    let lateCheckOut;
    if (hourDiff < 24) {
      totalRoomCharge = await toolRoom.priceInHour(hourDiff, roomCharge);
    } else {
      const early = await toolRoom.earlyCheckIn(checkInDate, roomCharge);
      const late = await toolRoom.lateCheckOut(checkOutDate, roomCharge);

      earlyCheckIn = early.price;
      lateCheckOut = late.price;
      totalRoomCharge =
        ((hourDiff - early.hour - late.hour) * roomCharge) / 24 +
        earlyCheckIn +
        lateCheckOut;
    }

    // //Calculate service's price
    const serviceCharge = await toolService.calculateServiceCharge(services);

    //Price
    const VAT = 10;
    const totalPrice = (
      (totalRoomCharge + serviceCharge) *
      (1 + VAT / 100)
    ).toFixed();

    //All good
    let updateBooking = {
      rooms,
      customer,
      checkInDate,
      checkOutDate,
      earlyCheckIn,
      lateCheckOut,
      roomCharge: Math.round(totalRoomCharge),
      services,
      serviceCharge: serviceCharge,
      deposit,
      discount,
      VAT,
      totalPrice,
      status,
    };

    const bookingUpdateCondition = { _id: req.params.id };

    let updatedBooking = await Booking.findOneAndUpdate(
      bookingUpdateCondition,
      updateBooking,
      {
        new: true,
      }
    );
    //Change STATUS ROOM
    const statusRoom = status === 'CHECK IN' ? 'OCCUPIED' : 'BOOKING';
    await toolRoom.changeStatusArrayRooms(rooms, statusRoom);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      updatedBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const cancelBooking = async (req, res) => {
  const bookingID = req.params.bookingID;
  try {
    const booking = await Booking.findById(bookingID);
    const rooms = booking.rooms;
    const status = booking.status;
    if (status === 'CHECK IN' || status === 'CHECK OUT')
      return res.status(400).json({
        success: false,
        message: 'Booking has been check in or check out',
      });

    //UPDATE
    const bookingUpdateCondition = { _id: bookingID };

    let updateBooking = {
      isDeleted: true,
      status: 'CANCELLED',
    };
    let updatedBooking = await Booking.findOneAndUpdate(
      bookingUpdateCondition,
      updateBooking,
      {
        new: true,
      }
    );
    //Change STATUS room
    await toolRoom.changeStatusArrayRooms(rooms, 'READY');
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      updatedBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const changeRoom = async (req, res) => {
  const bookingID = req.params.bookingID;
  const roomChooseID = req.params.roomChooseID;
  const roomChangeID = req.params.roomChangeID;

  try {
    const booking = await Booking.findById(bookingID);
    const serviceCharge = booking.serviceCharge;
    const checkInDate = booking.checkInDate;
    const checkOutDate = booking.checkOutDate;
    const newRooms = toolRoom.changeRoom(
      booking.rooms,
      roomChooseID,
      roomChangeID
    );

    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(newRooms);

    // Calculate price
    let totalRoomCharge;
    let earlyCheckIn;
    let lateCheckOut;
    if (hourDiff < 24) {
      totalRoomCharge = await toolRoom.priceInHour(hourDiff, roomCharge);
    } else {
      const early = await toolRoom.earlyCheckIn(checkInDate, roomCharge);
      const late = await toolRoom.lateCheckOut(checkOutDate, roomCharge);

      earlyCheckIn = early.price;
      lateCheckOut = late.price;
      totalRoomCharge =
        ((hourDiff - early.hour - late.hour) * roomCharge) / 24 +
        earlyCheckIn +
        lateCheckOut;
    }

    //Price
    const VAT = 10;
    const totalPrice = (
      (totalRoomCharge + serviceCharge) *
      (1 + VAT / 100)
    ).toFixed(0);

    //UPDATE
    const bookingUpdateCondition = { _id: bookingID };

    let updateBooking = {
      rooms: newRooms,
      earlyCheckIn,
      lateCheckOut,
      roomCharge: Math.round(totalRoomCharge),
      totalPrice,
    };

    let updatedBooking = await Booking.findOneAndUpdate(
      bookingUpdateCondition,
      updateBooking,
      {
        new: true,
      }
    );
    //Change STATUS room
    await toolRoom.changeStatusArrayRooms(newRooms, 'OCCUPIED');
    await toolRoom.changeStatusOneRoom(roomChooseID, 'READY');

    res.json({
      success: true,
      message: 'Change room successfully',
      updatedBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
module.exports = {
  createBooking,
  getAllBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
  changeRoom,
};
