const router = require('express').Router();
const roomController = require('../../controllers/room');
const { checkManager, checkAdmin } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const verifyImage = require('../../middleware/verifyImg');

// @route POST api/room/
// @decs CREATE room
// @access Private
router.post('/', verifyToken, checkManager, roomController.createRoom);

// @route GET api/room/
// @decs READ ALL room
// @access Private
router.get('/', roomController.getAllRooms);

// @route GET api/room/:floor
// @decs SORT room by floor
// @access Private
router.get('/all-by-floor/:floor', verifyToken, roomController.getRoomByFloor);

// @route GET api/room/:id
// @decs READ 1 ROOM
// @access Private
router.get('/:id', verifyToken, roomController.getRoomById);

// @route PUT api/room/
// @decs UPDATE room by ID
// @access Private
router.put('/update/:id', verifyToken, checkManager, roomController.updateRoom);

// @route PUT api/room/
// @decs DELETE room
// @access Private
router.put(`/delete/:id`, verifyToken, checkManager, roomController.deleteRoom);

// @route PUT api/room/
// @decs CHANGE STATUS ROOM
// @access Private
router.put(
  `/change-status/:status/:id`,
  verifyToken,
  roomController.changeStatusRoom
);

// @route PUT api/room/
// @decs CHANGE STATUS ROOM
// @access Private
router.put(`/change-price`, verifyToken, roomController.changePriceRoom);

// @route GET api/room/
// @decs Check status Room ROOM
// @access Private
router.post(`/check-available`, roomController.checkAvailable);

// @route PUT api/room/
// @decs upload Image
// @access Private
router.put(
  '/upload-img/:id',
  verifyImage,
  verifyToken,
  checkManager,
  roomController.uploadImg
);

module.exports = router;
