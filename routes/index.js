const router = require('express').Router();
const { appConstant } = require('../config/constants');
const key = require('../config/key');
const { baseUrl } = appConstant;
const api = `/${baseUrl}`;

// IMPORT ROUTE
const roomRouter = require('./api/room');
const authRouter = require('./api/auth');
const userRouter = require('./api/user');
const customerRouter = require('./api/customer');
const serviceRouter = require('./api/service');
const bookingRouter = require('./api/booking');
const receiptRouter = require('./api/receipt');
const typeOfRoomRouter = require('./api/typeOfRoom');
const convenienceRouter = require('./api/convenience');
const couponRouter = require('./api/coupon');
const paymentRouter = require('./api/payment');

//API ROUTES
router.use(`${api}/auth`, authRouter);
router.use(`${api}/user`, userRouter);
router.use(`${api}/customer`, customerRouter);
router.use(`${api}/room`, roomRouter);
router.use(`${api}/service`, serviceRouter);
router.use(`${api}/booking`, bookingRouter);
router.use(`${api}/receipt`, receiptRouter);
router.use(`${api}/type-of-room`, typeOfRoomRouter);
router.use(`${api}/convenience`, convenienceRouter);
router.use(`${api}/coupon`, couponRouter);
router.use(`${api}/payment`, paymentRouter);
router.use(api, (req, res) =>
  res.status(404).json({
    success: false,
    message: 'No API route found',
  })
);

module.exports = router;
