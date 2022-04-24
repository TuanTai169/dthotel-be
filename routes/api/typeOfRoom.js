const router = require('express').Router();
const { checkManager } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const typeController = require('../../controllers/typeOfRoom');

// @route POST api/Type/
// @decs CREATE Type
// @access Private
router.post('/', verifyToken, checkManager, typeController.createType);

// @route GET api/Type/
// @decs READ ALL Type
// @access Private
router.get('/', verifyToken, typeController.getAllTypes);

// @route GET api/Type/:id
// @decs READ 1 Type
// @access Private
router.get('/:id', verifyToken, typeController.getTypeById);

// @route PUT api/Type/
// @decs UPDATE Type
// @access Private
router.put('/update/:id', verifyToken, checkManager, typeController.updateType);

// @route PUT api/Type/
// @decs DELETE Type
// @access Private
router.put(`/delete/:id`, verifyToken, checkManager, typeController.deleteType);

module.exports = router;
