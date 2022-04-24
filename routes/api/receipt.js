const router = require('express').Router();
const verifyToken = require('../../middleware/authorization');
const receiptController = require('../../controllers/receipt');

// @route POST api/receipt/
// @decs CREATE RECEIPT / CHECKOUT
// @access Private
router.post('/', verifyToken, receiptController.createReceipt);

// @route GET api/receipt/
// @decs READ ALL RECEIPT / PAYMENT
// @access Private
router.get('/', verifyToken, receiptController.getAllReceipts);

// @route POST api/receipt/
// @decs READ 1 RECEIPT / PAYMENT
// @access Private
router.get('/:id', verifyToken, receiptController.getReceiptById);

// @route PUT api/receipt/
// @decs UPDATE receipt
// @access Private
router.put(`/update/:id`, verifyToken, receiptController.updateReceipt);

// @route GET api/receipt/
// @decs STATISTIC
// @access Private
//router.get('/statistic', verifyToken, receiptController.statistic);

module.exports = router;
