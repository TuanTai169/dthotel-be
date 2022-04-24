const router = require('express').Router();
const { checkManager } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const convenienceController = require('../../controllers/convenience');

// @route POST api/Convenience/
// @decs CREATE Convenience
// @access Private
router.post(
  '/',
  verifyToken,
  checkManager,
  convenienceController.createConvenience
);

// @route GET api/Convenience/
// @decs READ ALL Convenience
// @access Private
router.get('/', verifyToken, convenienceController.getAllConveniences);

// @route GET api/Convenience/:id
// @decs READ 1 Convenience
// @access Private
router.get('/:id', verifyToken, convenienceController.getConvenienceById);

// @route PUT api/Convenience/
// @decs UPDATE Convenience
// @access Private
router.put(
  '/update/:id',
  verifyToken,
  checkManager,
  convenienceController.updateConvenience
);

// @route PUT api/Convenience/
// @decs DELETE Convenience
// @access Private
router.put(
  `/delete/:id`,
  verifyToken,
  checkManager,
  convenienceController.deleteConvenience
);

module.exports = router;
