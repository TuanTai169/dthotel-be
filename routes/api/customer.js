const router = require('express').Router();
const verifyToken = require('../../middleware/authorization');
const customerController = require('../../controllers/customer');
// @route POST api/customer/
// @decs CREATE customer
// @access Private
router.post('/', verifyToken, customerController.createCustomer);

// @route GET api/customer/
// @decs READ ALL customer
// @access Private
router.get('/', verifyToken, customerController.getAllCustomer);

// @route GET api/customer/
// @decs READ 1 customer
// @access Private
router.get('/:id', verifyToken, customerController.getCustomerById);

// @route PUT api/customer/
// @decs UPDATE customer
// @access Private
router.put('/update/:id', verifyToken, customerController.updateCustomer);

// @route PUT api/customer/
// @decs DELETE customer
// @access Private
router.put(`/delete/:id`, verifyToken, customerController.deleteCustomer);
module.exports = router;
