const router = require('express').Router();
const { checkManager } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const serviceController = require('../../controllers/service');

// @route POST api/service/
// @decs CREATE service
// @access Private
router.post('/', verifyToken, checkManager, serviceController.createService);

// @route GET api/service/
// @decs READ ALL service
// @access Private
router.get('/', verifyToken, serviceController.getAllServices);

// @route GET api/service/:id
// @decs READ 1 service
// @access Private
// router.get('/:id', verifyToken, serviceController.getServiceById);

// @route PUT api/service/
// @decs UPDATE service
// @access Private
router.put(
  '/update/:id',
  verifyToken,
  checkManager,
  serviceController.updateService
);

// @route PUT api/service/
// @decs DELETE service
// @access Private
router.put(
  `/delete/:id`,
  verifyToken,
  checkManager,
  serviceController.deleteService
);
module.exports = router;
