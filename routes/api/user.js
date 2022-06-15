const router = require('express').Router();
const { checkAdmin, checkManager } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const verifyImage = require('../../middleware/verifyImg');
require('dotenv').config();
const _ = require('lodash');
const userController = require('../../controllers/user');

// @route GET api/user/
// @decs READ all user
// @access Private
router.get('/', verifyToken, userController.getUser);

// @route GET api/user/
// @decs READ a user
// @access Private
// router.get('/:id', verifyToken, userController.getUserById);

// @route POST api/user/
// @decs CREATE user
// @access Private
router.post('/', verifyToken, checkManager, userController.createUser);

// @route PUT api/user/
// @decs UPDATE PROFILE
// @access Private
router.put(`/update-profile/:id`, verifyToken, userController.updateProfile);

// @route PUT api/user/
// @decs CHANGE PASSWORD
// @access Private
router.put(`/change-password/:id`, verifyToken, userController.changePassword);

// @route PUT api/user/
// @decs UPDATE user
// @access Private
router.put(`/update/:id`, verifyToken, checkManager, userController.updateUser);

// @route DELETE api/user/
// @decs delete user
// @access Private
router.put(`/delete/:id`, verifyToken, checkManager, userController.deleteUser);

// // @route UPDATE api/user/
// // @decs change ROLES
// // @access Private
// router.put(`/change-role/:id`, verifyToken, checkAdmin, async (req, res) => {
//   const { role } = req.body
//   try {
//     const userUpdateCondition = { _id: req.params.id }
//     const updated = { roles: role, updateBy: req.userId }
//     let updatedUser = await User.findOneAndUpdate(
//       userUpdateCondition,
//       updated,
//       {
//         new: true,
//       }
//     )
//     res.json({
//       success: true,
//       message: "User updated successfully",
//       updatedUser,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     })
//   }
// })

// @route UPDATE api/user/
// @decs UPDATE FILE AVATAR
// @access Private
router.put(
  '/upload-avatar/:id',
  verifyImage,
  verifyToken,
  userController.uploadAvatar
);

module.exports = router;
