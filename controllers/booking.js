const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Room = require('../models/Room');
const TypeOfRoom = require('../models/TypeOfRoom');
const Convenience = require('../models/Convenience');
const Coupon = require('../models/Coupon');
const toolRoom = require('../tools/roomTool');
const toolService = require('../tools/serviceTool');
const { customerValidation } = require('../tools/validation');
const { RoomStatus, BookingStatus } = require('../config/constants');
const { sendEmail } = require('../utils/google-api');

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
        message: 'Room not ready on this day',
      });

    //Generate code
    const code = 'DT' + Date.now().toString();

    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(rooms);

    // Calculate price
    let totalRoomCharge = 0;
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
    const serviceCharge = await toolService.calculateServiceCharge(
      services,
      'service'
    );
    const productCharge = await toolService.calculateServiceCharge(
      products,
      'product'
    );

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(discount);

    //Change status
    let status = BookingStatus.Booking.name;

    //Price
    const VAT = 10;

    const totalPrice = Number(
      parseFloat(
        (totalRoomCharge + serviceCharge + productCharge) *
          (1 + VAT / 100 - discountCharge / 100) -
          deposit
      ).toFixed(2)
    );

    const roomList = rooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    // Save to object detail
    const listRoom = await toolRoom.getAllInfoRoom(rooms);
    const customerCurrent = await Customer.findById(customer).select(
      'name email phone idNumber address'
    );
    const listService = await toolService.getAllInfoService(
      services.map((x) => x.service)
    );
    const listProduct = await toolService.getAllInfoService(
      products.map((x) => x.product)
    );
    const detailDiscount = await Coupon.findById(discount).select(
      'code discount desc'
    );

    const detail = {
      code,
      rooms: listRoom,
      customer: customerCurrent,
      services: listService,
      products: listProduct,
      deposit,
      discount: detailDiscount,
      checkInDate,
      checkOutDate,
      earlyCheckIn,
      lateCheckOut,
      totalPrice: Number(totalPrice),
    };

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
      detail,
    });

    await newBooking.save();

    //Change STATUS ROOM
    const statusOfRoom =
      status === RoomStatus.Booking.name
        ? RoomStatus.Booking.name
        : RoomStatus.Occupied.name;
    await toolRoom.changeStatusArrayRooms(rooms, statusOfRoom);

    //Send to customer email
    // const customerExist = await Customer.findById(customer);

    const message = `
              <div style="max-width: 700px; margin:auto; border: 8px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase; color: teal;">Thank to customer</h2>
              <p> Dear <strong> ${customerCurrent.name}</strong>!</p>
              <p> Booking Code:  <strong> ${code}</strong></p>
              <p> Check-in date:  <strong> ${checkInDate}</strong></p>
              <p> Deposit:  <strong> ${deposit} USD</strong></p>
              <p> TotalPrice:  <strong> ${Number(totalPrice)} USD</strong></p>
              <p>Thank you booking for our hotel! See you again on the closest day!</p>
              </div>
            `;

    await sendEmail({
      email: customerExist.email,
      subject: `THANK YOU BOOKING!`,
      message,
    });

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

const createBookingInWeb = async (req, res) => {
  const {
    rooms,
    customer, // Object customer
    checkInDate,
    checkOutDate,
    services,
    products,
    deposit,
    discount,
  } = req.body;

  const { name, email, phone, idNumber, address, numberOfPeople } = customer;
  //Validation
  const { error } = customerValidation(customer);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  try {
    // Check booking exist
    const checkStatus = await toolRoom.checkStatusRoom(checkInDate, rooms);

    if (checkStatus === false)
      return res.status(400).json({
        success: false,
        message: 'Room has been booking or occupied on this day',
      });

    //Check customer existed
    const existedCustomer = await Customer.findOne({ email });
    if (!existedCustomer) {
      //All good
      const newCustomer = new Customer({
        name,
        email,
        phone,
        idNumber,
        address,
        numberOfPeople,
      });
      await newCustomer.save();
    } else {
      let updateCustomer = {
        name,
        email,
        phone,
        idNumber,
        address,
        numberOfPeople,
      };

      const cusUpdatedCondition = { _id: existedCustomer._id };
      await Customer.findOneAndUpdate(cusUpdatedCondition, updateCustomer, {
        new: true,
      });
    }

    const customerCurrent = await Customer.findOne({ email });

    //Generate code
    const code = 'DT' + Date.now().toString();

    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(rooms);

    // Calculate price
    let totalRoomCharge = 0;
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

    //Calculate service's price
    const serviceCharge = await toolService.calculateServiceCharge(
      services,
      'service'
    );
    const productCharge = await toolService.calculateServiceCharge(
      products,
      'product'
    );

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(discount);

    //Change status
    let status = BookingStatus.Booking.name;

    //Price
    const VAT = 10;

    const totalPrice = Number(
      parseFloat(
        (totalRoomCharge + serviceCharge + productCharge) *
          (1 + VAT / 100 - discountCharge / 100) -
          deposit
      ).toFixed(2)
    );

    const roomList = rooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    // Save to object detail
    const listRoom = await toolRoom.getAllInfoRoom(rooms);

    const listService = await toolService.getAllInfoService(
      services.map((x) => x.service)
    );
    const listProduct = await toolService.getAllInfoService(
      products.map((x) => x.product)
    );
    const detailDiscount = await Coupon.findById(discount).select(
      'code discount desc'
    );

    const detail = {
      code,
      rooms: listRoom,
      customer: customerCurrent,
      services: listService,
      products: listProduct,
      deposit,
      discount: detailDiscount,
      checkInDate,
      checkOutDate,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
    };

    const newBooking = new Booking({
      code,
      rooms: roomList,
      customer: customerCurrent._id,
      services,
      products,
      deposit,
      discount,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
      status,
      detail,
    });

    await newBooking.save();

    //Change STATUS ROOM
    await toolRoom.changeStatusArrayRooms(rooms, status);

    //Send to customer email

    const message = `
               <div style="max-width: 700px; margin:auto; border: 8px solid #ddd; padding: 50px 20px; font-size: 110%;">
               <h2 style="text-align: center; text-transform: uppercase; color: teal;">Thank to customer</h2>
               <p> Dear <strong> ${customerCurrent.name}</strong>!</p>
               <p> Booking Code:  <strong> ${code}</strong></p>
               <p> Check-in date:  <strong> ${checkInDate}</strong></p>
               <p> Deposit:  <strong> ${deposit} USD</strong></p>
               <p> TotalPrice:  <strong> ${Number(totalPrice)} USD</strong></p>
               <p>Thank you using for our hotel! See you again on the closest day!</p>
               </div>
             `;

    await sendEmail({
      email: customerCurrent.email,
      subject: `THANK YOU BOOKING!`,
      message,
    });

    res.json({
      success: true,
      message: `Booking successfully ! Please check info!`,
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

const createCheckIn = async (req, res) => {
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
        message: 'Room not ready on this day',
      });

    //Generate code
    const code = 'DT' + Date.now().toString();

    //Calculate diffInDays
    const hourDiff = toolRoom.getNumberOfHour(checkInDate, checkOutDate);

    //Calculate room's price
    const roomCharge = await toolRoom.calculateRoomCharge(rooms);

    // Calculate price
    let totalRoomCharge = 0;
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
    const serviceCharge = await toolService.calculateServiceCharge(
      services,
      'service'
    );
    const productCharge = await toolService.calculateServiceCharge(
      products,
      'product'
    );

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(discount);

    //Change status
    let status = BookingStatus.checkIn.name;

    //Price
    const VAT = 10;

    const totalPrice = Number(
      parseFloat(
        (totalRoomCharge + serviceCharge + productCharge) *
          (1 + VAT / 100 - discountCharge / 100) -
          deposit
      ).toFixed(2)
    );

    const roomList = rooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    // Save to object detail
    const listRoom = await toolRoom.getAllInfoRoom(rooms);
    const customerCurrent = await Customer.findById(customer).select(
      'name email phone idNumber address'
    );
    const listService = await toolService.getAllInfoService(
      services.map((x) => x.service)
    );
    const listProduct = await toolService.getAllInfoService(
      products.map((x) => x.product)
    );
    const detailDiscount = await Coupon.findById(discount).select(
      'code discount desc'
    );

    const detail = {
      code,
      rooms: listRoom,
      customer: customerCurrent,
      services: listService,
      products: listProduct,
      deposit,
      discount: detailDiscount,
      checkInDate,
      checkOutDate,
      earlyCheckIn,
      lateCheckOut,
      totalPrice: Number(totalPrice),
    };

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
      detail,
    });

    await newBooking.save();

    //Change STATUS ROOM
    const statusOfRoom =
      status === RoomStatus.Booking.name
        ? RoomStatus.Booking.name
        : RoomStatus.Occupied.name;
    await toolRoom.changeStatusArrayRooms(rooms, statusOfRoom);

    //Send to customer email
    // const customerExist = await Customer.findById(customer);

    const message = `
              <div style="max-width: 700px; margin:auto; border: 8px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase; color: teal;">Thank to customer</h2>
              <p> Dear <strong> ${customerCurrent.name}</strong>!</p>
              <p> Booking Code:  <strong> ${code}</strong></p>
              <p> Check-in date:  <strong> ${checkInDate}</strong></p>
              <p> Deposit:  <strong> ${deposit} USD</strong></p>
              <p> TotalPrice:  <strong> ${Number(totalPrice)} USD</strong></p>
              <p>Thank you booking for our hotel! See you again on the closest day!</p>
              </div>
            `;

    await sendEmail({
      email: customerExist.email,
      subject: `THANK YOU BOOKING!`,
      message,
    });

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
        path: 'products',
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
    code,
    rooms,
    customer,
    checkInDate,
    checkOutDate,
    services,
    products,
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
    const serviceCharge = await toolService.calculateServiceCharge(
      services,
      'service'
    );
    const productCharge = await toolService.calculateServiceCharge(
      products,
      'product'
    );

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(discount);

    //Price
    const VAT = 10;
    const totalPrice = Number(
      parseFloat(
        (totalRoomCharge + serviceCharge + productCharge) *
          (1 + VAT / 100 - discountCharge / 100) -
          deposit
      ).toFixed(0)
    );

    const roomList = rooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    // Save to object detail
    const listRoom = await toolRoom.getAllInfoRoom(rooms);

    const listService = await toolService.getAllInfoService(
      services.map((x) => x.service)
    );
    const listProduct = await toolService.getAllInfoService(
      products.map((x) => x.product)
    );
    const detailDiscount = await Coupon.findById(discount).select(
      'code discount desc'
    );

    const customerCurrent = await Customer.findOne({ customer });

    const detail = {
      code,
      rooms: listRoom,
      customer: customerCurrent,
      services: listService,
      products: listProduct,
      deposit,
      discount: detailDiscount,
      checkInDate,
      checkOutDate,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
    };

    //All good
    let updateBooking = {
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
      detail,
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
    const statusRoom =
      status === BookingStatus.checkIn.name
        ? RoomStatus.Occupied.name
        : RoomStatus.Booking.name;
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
    const rooms = booking.rooms.map((r) => r.room);

    const status = booking.status;
    if (
      status === BookingStatus.checkIn.name ||
      status === BookingStatus.checkout.name
    )
      return res.status(400).json({
        success: false,
        message: 'Booking has been check in or check out',
      });

    if (
      toolRoom.getNumberOfDays(
        booking.rooms[0].checkInDate,
        new Date().toJSON()
      ) > 0 &&
      toolRoom.getNumberOfDays(
        booking.rooms[0].checkInDate,
        new Date().toJSON() < 3
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Booking must be cancelled before 3 days',
      });
    }

    //UPDATE
    const bookingUpdateCondition = { _id: bookingID };

    let updateBooking = {
      isDeleted: true,
      status: BookingStatus.cancelled.name,
    };
    let updatedBooking = await Booking.findOneAndUpdate(
      bookingUpdateCondition,
      updateBooking,
      {
        new: true,
      }
    );
    //Change STATUS room
    await toolRoom.changeStatusArrayRooms(rooms, RoomStatus.Ready.name);
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
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
    const status = booking.status;

    const checkInDate = booking.rooms[0].checkInDate;
    const checkOutDate = booking.rooms[0].checkOutDate;

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
    let totalRoomCharge = 0;
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
    const serviceCharge = await toolService.calculateServiceCharge(
      booking.services,
      'service'
    );
    const productCharge = await toolService.calculateServiceCharge(
      booking.products,
      'product'
    );

    // Calculate discount
    const discountCharge = await toolRoom.calculateDiscount(booking.discount);

    //Price
    const VAT = 10;
    const totalPrice = Number(
      parseFloat(
        (totalRoomCharge + serviceCharge + productCharge) *
          (1 + VAT / 100 - discountCharge / 100) -
          booking.deposit
      ).toFixed(2)
    );

    const roomList = newRooms.map((room) => {
      return { room, checkInDate, checkOutDate };
    });

    //UPDATE
    const bookingUpdateCondition = { _id: bookingID };

    // Save to object detail
    const listRoom = await toolRoom.getAllInfoRoom(rooms);

    let detail = {
      ...booking.detail,
      rooms: listRoom,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
    };

    let updateBooking = {
      rooms: roomList,
      earlyCheckIn,
      lateCheckOut,
      totalPrice,
      detail,
    };

    let updatedBooking = await Booking.findOneAndUpdate(
      bookingUpdateCondition,
      updateBooking,
      {
        new: true,
      }
    );
    //Change STATUS room
    await toolRoom.changeStatusArrayRooms(newRooms, status);
    await toolRoom.changeStatusOneRoom(roomChooseID, RoomStatus.Ready.name);

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
  createBookingInWeb,
  createCheckIn,
  getAllBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
  changeRoom,
};
