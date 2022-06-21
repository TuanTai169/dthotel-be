const _ = require('lodash');
const Room = require('../models/Room');
const { roomValidation } = require('../tools/validation');
const toolRoom = require('../tools/roomTool');
const {
  imageDefault,
  capacityDefault,
  bedDefault,
  detailDefault,
  RoomStatus,
} = require('../config/constants');
const { uploadImage } = require('../utils/google-api');
const Booking = require('../models/Booking');

const createRoom = async (req, res) => {
  const {
    roomNumber,
    floor,
    name,
    price,
    capacity,
    detail,
    roomType,
    bed,
    convenience,
    images,
    status,
  } = req.body;

  //Validation
  const { error } = roomValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  try {
    //Check for existing room
    const roomExist = await Room.findOne({ roomNumber, isDeleted: false });
    if (roomExist)
      return res.status(400).json({
        success: false,
        message: 'Room already taken',
      });

    //All good
    const newRoom = new Room({
      roomNumber,
      floor,
      name,
      price,
      capacity: capacity || capacityDefault,
      detail: detail || detailDefault,
      roomType: roomType || [],
      bed: bed || bedDefault,
      convenience: convenience || [],
      images: images || imageDefault,
      status: status || RoomStatus.Ready.name,
    });

    await newRoom.save();
    res.json({
      success: true,
      message: 'Room created successfully',
      newRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isDeleted: false })
      .populate({
        path: 'roomType',
        select: '-isDeleted -createdAt -updatedAt -__v',
      })
      .populate({
        path: 'convenience',
        select: '-isDeleted -createdAt -updatedAt  -__v',
      })
      .select('-createdAt -updatedAt -__v -isDeleted');
    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getRoomByFloor = async (req, res) => {
  try {
    const rooms = await Room.find({ isDeleted: false, floor: req.params.floor })
      .populate({
        path: 'roomType',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .populate({
        path: 'convenience',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .select('-createdAt -updatedAt');
    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate({
        path: 'roomType',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .populate({
        path: 'convenience',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .select('-createdAt -updatedAt');
    if (!room)
      res.json({
        success: false,
        message: 'Room not found',
      });
    res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateRoom = async (req, res) => {
  const {
    roomNumber,
    floor,
    name,
    price,
    capacity,
    detail,
    roomType,
    bed,
    convenience,
    images,
    status,
  } = req.body;

  const id = req.params.id;
  //Validation
  if (!roomNumber || !price)
    return res.status(400).json({
      success: false,
      message: 'RoomNumber and price are required',
    });

  try {
    const roomExist = await Room.findOne({ roomNumber, isDeleted: false });
    if (roomExist && roomExist._id.toString() !== id)
      return res.status(400).json({
        success: false,
        message: 'Room already taken',
      });
    //All good
    let updateRoom = {
      roomNumber,
      floor,
      name,
      price,
      capacity,
      detail,
      roomType,
      bed,
      convenience,
      images,
      status,
    };

    const roomUpdatedCondition = { _id: id };

    let updatedRoom = await Room.findOneAndUpdate(
      roomUpdatedCondition,
      updateRoom,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Room updated successfully',
      updatedRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteRoom = async (req, res) => {
  const roomId = req.params.id;
  try {
    const findRoom = await Room.findById(roomId);

    if (findRoom.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or has been deleted!',
      });
    }

    if (
      findRoom.status === RoomStatus.Booking.name ||
      findRoom.status === RoomStatus.Occupied.name
    ) {
      return res.status(400).json({
        success: false,
        message: 'Not deleted ! Room is booking or occupied !',
      });
    }

    const roomDeleteCondition = { _id: roomId };
    const deleted = { isDeleted: true };
    let deletedRoom = await Room.findOneAndUpdate(
      roomDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Room deleted successfully',
      deletedRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }
};

const changeStatusRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const status =
      req.params.status === 'fix'
        ? RoomStatus.Fixing.name
        : req.params.status === 'occupied'
        ? RoomStatus.Occupied.name
        : req.params.status === 'clean'
        ? RoomStatus.Cleaning.name
        : req.params.status === 'book'
        ? RoomStatus.Booking.name
        : RoomStatus.Ready.name;
    const updatedRoom = await toolRoom.changeStatusOneRoom(roomId, status);

    res.json({
      success: true,
      message: `Room updated successfully`,
      updatedRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const changePriceRoom = async (req, res) => {
  const { list, percent } = req.body;
  try {
    const ratio = percent / 100;
    if (Math.abs(ratio) > 0.3) {
      return res.json({
        success: false,
        message:
          'Room rates cannot be increased or decreased by more than 30%.',
      });
    }

    if (Array.isArray(list) && list.length > 0) {
      await toolRoom.changePriceArrayRooms(list, ratio);
      res.json({
        success: true,
        message: `Price updated successfully`,
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

const uploadImg = async (req, res) => {
  const roomId = req.params.id;
  try {
    const fileList = Object.values(req.files);

    const imgList = [];
    for (const file of fileList) {
      const img = await uploadImage({
        name: file.name,
        filePath: file.tempFilePath,
      });
      if (!!img) {
        let src = img.webViewLink.replace('file/d/', 'uc?id=');
        src = src.replace('/view?usp=drivesdk', '');
        imgList.push({ src, alt: file.name });
      }
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.json({
        success: false,
        message: 'Room not found',
      });
    }

    const images = room?.images;

    const roomUpdateCondition = { _id: roomId };
    const updated = {
      images: [...imgList, ...images],
    };

    const updatedRoom = await Room.findOneAndUpdate(
      roomUpdateCondition,
      updated,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Upload images successfully',
      updatedRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const checkAvailable = async (req, res) => {
  const { checkInDate, checkOutDate, capacity } = req.body;
  const adult = capacity.adult;
  const child = capacity.child;
  try {
    const allRoom = await Room.find({ isDeleted: false })
      .populate({
        path: 'roomType',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .populate({
        path: 'convenience',
        select: '-isDeleted -createdAt -updatedAt',
      })
      .select('-createdAt -updatedAt');

    const listRoomIsAvailable = allRoom
      .filter((r) => r.status === RoomStatus.Ready.name)
      .filter((r) => r.capacity.adult <= adult);

    const listAvailable = [];
    if (child === 0) {
      listRoomIsAvailable.forEach((room) => {
        if (room.capacity.child === 0) {
          listAvailable.push(room);
        }
      });
    } else {
      listRoomIsAvailable.forEach((room) => {
        if (room.capacity.child > 0) {
          listAvailable.push(room);
        }
      });
    }

    res.json({
      success: true,
      message: 'Check available successfully',
      listRoom: listAvailable,
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
  createRoom,
  getAllRooms,
  getRoomByFloor,
  getRoomById,
  updateRoom,
  deleteRoom,
  changeStatusRoom,
  changePriceRoom,
  uploadImg,
  checkAvailable,
};
