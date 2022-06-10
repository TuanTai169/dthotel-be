const Coupon = require('../models/Coupon');

const createCoupon = async (req, res) => {
  const { code, discount, desc, startDate, endDate } = req.body;

  //Validation
  if (!code)
    return res.status(400).json({
      success: false,
      message: 'Code are required',
    });
  try {
    //Check for existing Coupon
    const CouponExist = await Coupon.findOne({
      code,
    });
    if (CouponExist)
      return res.status(400).json({
        success: false,
        message: 'Coupon already taken',
      });
    //All good
    const newCoupon = new Coupon({
      code,
      discount,
      desc,
      startDate,
      endDate,
    });

    await newCoupon.save();
    res.json({
      success: true,
      message: 'Coupon created successfully',
      newCoupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isDeleted: false }).select(
      '-createdAt -updatedAt '
    );
    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!Coupon)
      res.json({
        success: false,
        message: 'Coupon not found',
      });
    res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateCoupon = async (req, res) => {
  const { code, discount, desc } = req.body;
  const id = req.params.id;
  try {
    const couponExist = await Coupon.findOne({
      code,
    });

    if (couponExist && couponExist?._id.toString() !== id)
      return res.status(400).json({
        success: false,
        message: 'Coupon already taken',
      });
    //All good
    let updateCoupon = {
      code,
      discount,
      desc,
    };

    const CouponUpdatedCondition = { _id: id };
    let updatedCoupon = await Coupon.findOneAndUpdate(
      CouponUpdatedCondition,
      updateCoupon,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Coupon updated successfully',
      updatedCoupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const CouponDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedCoupon = await Coupon.findOneAndUpdate(
      CouponDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Coupon deleted successfully',
      deletedCoupon,
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
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
