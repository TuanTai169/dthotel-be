const Room = require('../models/Room');
const { roomValidation } = require('../tools/validation');
const toolRoom = require('../tools/roomTool');
const { imageDefault, capacityDefault } = require('../config/constants');

const createRoom = async (req, res) => {
  const {
    roomNumber,
    floor,
    price,
    capacity,
    desc,
    roomType,
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
      price,
      capacity: capacity || capacityDefault,
      desc,
      roomType,
      convenience,
      images: images || imageDefault,
      status,
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
      message: 'Internal server error',
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isDeleted: false })
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
    price,
    capacity,
    desc,
    roomType,
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
      price,
      capacity,
      desc,
      roomType,
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
  try {
    const roomDeleteCondition = { _id: req.params.id };
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
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const changeStatusRoom = async (req, res) => {
  try {
    // const roomId = req.params.id;
    // const userId = req.userId;
    // const status =
    //   req.params.status === 'fix'
    //     ? 'FIXING'
    //     : req.params.status === 'occupied'
    //     ? 'OCCUPIED'
    //     : req.params.status === 'clean'
    //     ? 'CLEANING'
    //     : req.params.status === 'book'
    //     ? 'BOOKING'
    //     : 'READY';
    // const updatedRoom = await toolRoom.changeStatusOneRoom(
    //   roomId,
    //   status,
    //   userId
    // );

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

const uploadImg = async (req, res) => {
  const userId = req.params.id;
  try {
    const file = req.files.file;

    const urlImg = await uploadImage({
      name: file.name,
      filePath: file.tempFilePath,
    });

    const userUpdateCondition = { _id: userId };
    const updated = {
      image: {
        src: urlImg.webViewLink,
        alt: file.name,
      },
    };

    await User.findOneAndUpdate(userUpdateCondition, updated, {
      new: true,
    });
    res.json({
      success: true,
      message: 'Upload avatar successfully',
      urlImg,
    });
  } catch (error) {
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
};
