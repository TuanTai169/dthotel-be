const Room = require('../models/Room');
const moment = require('moment');
const _ = require('lodash');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');

exports.changeStatusArrayRooms = async (rooms, status, userId) => {
  try {
    let statusRoomUpdate;
    const listRoom = await getAllInfoRoom(rooms);
    for (const room of listRoom) {
      if (room.status === 'OCCUPIED') {
        if (status === 'CLEANING') {
          statusRoomUpdate = 'CLEANING';
        } else {
          statusRoomUpdate = 'OCCUPIED';
        }
      } else if (room.status === 'BOOKING' && status === 'OCCUPIED') {
        statusRoomUpdate = 'OCCUPIED';
      } else {
        statusRoomUpdate = status;
      }

      const filter = { _id: room._id };
      const update = { status: statusRoomUpdate, updateBy: userId };
      updatedRoom = await Room.findByIdAndUpdate(filter, update, {
        new: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
exports.changeStatusOneRoom = async (room, status, userId) => {
  try {
    const filter = { _id: room };
    const update = { status: status, updateBy: userId };
    updatedRoom = await Room.findByIdAndUpdate(filter, update, {
      new: true,
    });
    return updatedRoom;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.calculateRoomCharge = async (rooms) => {
  const listRoom = await getAllInfoRoom(rooms);
  return _.sumBy(listRoom, (item) => item.price);
};

exports.checkStatusRoom = async (checkInDate, rooms) => {
  let check = true;
  const day = new Date(checkInDate);
  const listRoom = await getAllInfoRoom(rooms);
  const listBooking = await Booking.find({ isDeleted: false });

  for (const room of listRoom) {
    for (const booking of listBooking) {
      const roomListExist = booking.rooms.find(
        (r) => r.room.toString() === room._id.toString()
      );
      if (roomListExist) {
        const checkIn = new Date(roomListExist.checkInDate);
        const checkOut = new Date(roomListExist.checkOutDate);
        if (
          day.getTime() >= checkIn.getTime() &&
          day.getTime() <= checkOut.getTime()
        ) {
          check = false;
        }
      }
    }
  }

  return check;
};

exports.changeRoom = (rooms, roomChooseID, roomChangeID) => {
  const index = rooms.indexOf(roomChooseID);
  if (index !== -1) {
    rooms[index] = roomChangeID;
  }
  return rooms;
};

exports.getNumberOfDays = (checkInDate, checkOutDate) => {
  const start = moment(checkInDate, 'YYYY-MM-DD HH:mm');
  const end = moment(checkOutDate, 'YYYY-MM-DD HH:mm');
  //Difference in number of days
  const dayDiff =
    Math.round(moment.duration(end.diff(start)).asDays()) < 1
      ? 1
      : Math.round(moment.duration(end.diff(start)).asDays());
  return dayDiff;
};
exports.getNumberOfHour = (checkInDate, checkOutDate) => {
  const start = moment(checkInDate, 'YYYY-MM-DD HH:mm');
  const end = moment(checkOutDate, 'YYYY-MM-DD HH:mm');
  //Difference in number of days
  const hourDiff = moment.duration(end.diff(start)).asHours();
  return hourDiff;
};

exports.earlyCheckIn = (checkInDate, roomCharge) => {
  let early = {};

  const start = moment(checkInDate, 'YYYY-MM-DD HH:mm');
  const end = moment(checkInDate, 'YYYY-MM-DD').set({
    hours: 12,
    minutes: 00,
  });

  //Difference in number of days
  const diff = moment.duration(end.diff(start)).asHours();
  early['hour'] = diff;

  if (diff <= 4 && diff > 0) {
    early['price'] = 0.3 * roomCharge;
  } else if (diff <= 7 && diff > 4) {
    early['price'] = 0.5 * roomCharge;
  } else if (diff > 7) {
    early['price'] = 1 * roomCharge;
  } else {
    early['price'] = 0 * roomCharge;
  }
  return early;
};

exports.lateCheckOut = (checkOutDate, roomCharge) => {
  let late = {};

  const start = moment(checkOutDate, 'YYYY-MM-DD').set({
    hours: 12,
    minutes: 0,
  });
  const end = moment(checkOutDate, 'YYYY-MM-DD HH:mm');

  //Difference in number of days
  const diff = moment.duration(end.diff(start)).asHours();
  late['hour'] = diff;

  if (diff <= 3 && diff > 0) {
    late['price'] = 0.3 * roomCharge;
  } else if (diff <= 6 && diff > 3) {
    late['price'] = 0.5 * roomCharge;
  } else if (diff > 6) {
    late['price'] = 1 * roomCharge;
  } else {
    late['price'] = 0 * roomCharge;
  }
  return late;
};

exports.priceInHour = (hourDiff, roomCharge) => {
  let price = 0;
  if (hourDiff < 2) {
    price = 0.6 * roomCharge;
  } else {
    price = 0.6 * roomCharge + (0.4 * roomCharge * (hourDiff - 2)) / 22;
  }
  return price;
};

exports.calculateDiscount = async (discount) => {
  let price = 0;
  try {
    const coupon = await Coupon.find({ _id: discount });
    if (!coupon) {
      return price;
    }
    return price;
  } catch (error) {}
  console.log(discount);
};

const getAllInfoRoom = async (rooms) => {
  const promise = rooms.map((room) => {
    return Room.findById(room);
  });
  return await Promise.all(promise);
};
