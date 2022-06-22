const router = require('express').Router();
const paymentController = require('../../controllers/payment');

// @route POST api/payment/
// @decs CREATE payment
// @access Private
router.post('/create_payment_url', paymentController.createPaymentUrl);

router.get('/vnpay_ipn', paymentController.getIpn);

router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
