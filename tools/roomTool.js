const moment = require('moment');
const _ = require('lodash');

const Room = require('../models/Room');
const TypeOfRoom = require('../models/TypeOfRoom');
const Convenience = require('../models/Convenience');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const { RoomStatus, BookingStatus } = require('../config/constants');

exports.changeStatusArrayRooms = async (rooms, status) => {
  try {
    let statusRoomUpdate;
    const listRoom = await getAllInfoRoom(rooms);
    for (const room of listRoom) {
      if (room.status === RoomStatus.Occupied.name) {
        if (status === RoomStatus.Cleaning.name) {
          statusRoomUpdate = RoomStatus.Cleaning.name;
        } else {
          statusRoomUpdate = RoomStatus.Occupied.name;
        }
      } else if (
        room.status === RoomStatus.Booking.name &&
        status === RoomStatus.Occupied.name
      ) {
        statusRoomUpdate = RoomStatus.Occupied.name;
      } else {
        statusRoomUpdate = status;
      }

      const filter = { _id: room._id };
      const update = { status: statusRoomUpdate };
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

exports.changePriceArrayRooms = async (rooms, percent) => {
  try {
    const listRoom = await getAllInfoRoom(rooms);
    for (const room of listRoom) {
      const filter = { _id: room._id };
      const update = {
        price: Number.parseFloat(room.price * (1 + percent)).toFixed(2),
      };
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
exports.changeStatusOneRoom = async (room, status) => {
  try {
    const filter = { _id: room };
    const update = { status: status };
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
  const day = new Date(checkInDate);
  const listRoom = await getAllInfoRoom(rooms);
  const listBooking = await Booking.find({ isDeleted: false });

  for (const room of listRoom) {
    if (
      room.status === RoomStatus.Cleaning.name ||
      room.status === RoomStatus.Fixing.name
    ) {
      return false;
    }
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
          return false;
        }
      }
    }
  }

  return true;
};

exports.changeRoom = (rooms, roomChooseID, roomChangeID) => {
  const index = rooms.findIndex((r) => r.room.toString() === roomChooseID);
  if (index > -1) {
    rooms[index].room = roomChangeID;
  }
  return rooms.map((r) => r.room);
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
    return Room.findById(room).select('-createdAt -updatedAt -isDeleted');
  });
  return await Promise.all(promise);
};

const getAllInfoConvenience = async (list) => {
  const promise = list.map((item) => {
    return Room.findById(item).select('-createdAt -updatedAt -isDeleted');
  });
  return await Promise.all(promise);
};

const getAllInfoType = async (id) => {
  return await TypeOfRoom.findById(id).select(
    '-createdAt -updatedAt -isDeleted'
  );
};

exports.getAllInfoRoom = getAllInfoRoom;
exports.getAllInfoConvenience = getAllInfoConvenience;
exports.getAllInfoType = getAllInfoType;
