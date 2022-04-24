const router = require('express').Router();
const { checkManager } = require('../../middleware/authentication');
const verifyToken = require('../../middleware/authorization');
const couponController = require('../../controllers/coupon');

// @route POST api/coupon/
// @decs CREATE coupon
// @access Private
router.post('/', verifyToken, checkManager, couponController.createCoupon);

// @route GET api/coupon/
// @decs READ ALL coupon
// @access Private
router.get('/', verifyToken, couponController.getAllCoupons);

// @route GET api/coupon/:id
// @decs READ 1 coupon
// @access Private
router.get('/:id', verifyToken, couponController.getCouponById);

// @route PUT api/coupon/
// @decs UPDATE coupon
// @access Private
router.put(
  '/update/:id',
  verifyToken,
  checkManager,
  couponController.updateCoupon
);

// @route PUT api/coupon/
// @decs DELETE coupon
// @access Private
router.put(
  `/delete/:id`,
  verifyToken,
  checkManager,
  couponController.deleteCoupon
);

module.exports = router;
