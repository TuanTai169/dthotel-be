const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { roomValidation } = require('../tools/validation');
const toolRoom = require('../tools/roomTool');
const {
  imageDefault,
  capacityDefault,
  RoomStatus,
} = require('../config/constants');
const { uploadImage } = require('../utils/google-api');

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
      desc: desc || '',
      roomType: roomType || [],
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
      message: 'Internal server error',
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
        let src = img.webViewLink.replace('file/d/', 'thumbnail?id=');
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
      images: [...images, ...imgList],
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
  try {
    res.json({
      success: true,
      message: 'Upload images successfully',
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
  uploadImg,
};
