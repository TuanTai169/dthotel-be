const _ = require('lodash');
const moment = require('moment');
const Booking = require('../models/Booking');
const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');

const toolRoom = require('../tools/roomTool');
const toolReceipt = require('../tools/receiptTool');
const { sendEmail } = require('../utils/google-api');
const { receiptValidation } = require('../tools/validation');
const { RoomStatus, BookingStatus } = require('../config/constants');

const createReceipt = async (req, res) => {
  const { booking, paidOut, refund, modeOfPayment } = req.body;

  //Validation
  const { error } = receiptValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  try {
    const bookingItem = await Booking.findById(booking);
    if (!bookingItem)
      return res.status(400).json({
        success: false,
        message: 'Booking not found',
      });

    // Check for existing receipt
    const receiptExist = await Receipt.findOne({ booking });
    if (receiptExist)
      return res.status(400).json({
        success: false,
        message: 'Receipt already taken',
      });
    //ALL GOOD
    const newReceipt = new Receipt({
      booking,
      paidOut,
      refund,
      modeOfPayment,
      status,
    });
    await newReceipt.save();

    //Change STATUS ROOM
    await toolRoom.changeStatusArrayRooms(
      bookingItem.rooms,
      RoomStatus.Cleaning.name
    );

    //Change STATUS RECEIPT
    await toolReceipt.changeStatusBooking(booking, BookingStatus.Checkout.name);

    //Send to customer email
    const customer = await Customer.findById(bookingItem.customer);

    const message = `
              <div style="max-width: 700px; margin:auto; border: 8px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase; color: teal;">Thank to customer</h2>
              <p> Dear <strong> ${customer.name}</strong>!</p>
              <p>Congratulations on your successful payment ! Have a beautiful day! </p>
              <p>Thank you for using our service! See you again on the closest day!</p>
              </div>
            `;

    await sendEmail({
      email: customer.email,
      subject: `THANK YOU !`,
      message,
    });

    res.json({
      success: true,
      message: `Receipt created successfully`,
      newReceipt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ isActive: true }).populate({
      path: 'booking',
      select: '-isDeleted -createdAt -updatedAt',
      populate: [
        { path: 'customer', select: 'name email phone' },
        {
          path: 'rooms',
          select: 'roomNumber floor price roomType status',
        },
        {
          path: 'services',
          select: 'name price',
        },
        {
          path: 'discount',
          select: 'code discount desc ',
        },
      ],
    });
    res.json({
      success: true,
      receipts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate({
      path: 'booking',
      select: '-isActive -createBy -updateBy -createdAt -updatedAt',
      populate: { path: 'customer', select: 'name email phone' },
      populate: [
        { path: 'customer', select: 'name email phone' },
        {
          path: 'rooms',
          select: 'roomNumber floor price roomType status',
        },
        {
          path: 'services',
          select: 'name price',
        },
        {
          path: 'discount',
          select: 'code discount desc ',
        },
      ],
    });

    res.json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateReceipt = async (req, res) => {
  const { booking, paidOut, refund } = req.body;

  try {
    // All good
    let updateReceipt = {
      booking,
      paidOut,
      refund,
      status: 'PAID',
    };

    const receiptUpdateCondition = { _id: req.params.id };

    let updatedReceipt = await Receipt.findByIdAndUpdate(
      receiptUpdateCondition,
      updateReceipt,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Receipt updated successfully',
      updatedReceipt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// const statistic = async (req, res) => {
//   try {
//     // RECEIPTS
//     const receipts = await Receipt.find({ isActive: true }).populate({
//       path: 'booking',
//       select: ' -createdAt -updatedAt',
//       populate: [
//         { path: 'customer', select: 'name email phone' },
//         {
//           path: 'rooms',
//           select: 'roomNumber floor price roomType status',
//         },
//         {
//           path: 'services',
//           select: 'name price',
//         },
//       ],
//     });

//     // BOOKING
//     const allBookings = await Booking.find()
//       .populate({ path: 'customer', select: 'name email phone' })
//       .populate({
//         path: 'rooms',
//         select: 'roomNumber floor price roomType status',
//       })
//       .populate({
//         path: 'services',
//         select: 'name price',
//       });

//     let map_month = [];
//     let map_booking_day = [];
//     let map_service = [];
//     let map_user = [];
//     let map_room = [];
//     let map_room_status = [];
//     let invoiceRevenue = [];
//     const monthNames = [
//       'Jan',
//       'Feb',
//       'Mar',
//       'Apr',
//       'May',
//       'Jun',
//       'Jul',
//       'Aug',
//       'Sep',
//       'Oct',
//       'Nov',
//       'Dec',
//     ];
//     const dayNames = [
//       'Monday',
//       'Tuesday',
//       'Wednesday',
//       'Thursday',
//       'Friday',
//       'Saturday',
//       'Sunday',
//     ];

//     let totalRevenue = _.sumBy(receipts, (item) => item.booking.totalPrice);

//     _.forEach(receipts, (item) => {
//       let invoice = {
//         bookingId: item.booking.code,
//         customer: item.booking.customer.name,
//         checkInDate: item.booking.checkInDate,
//         checkOutDate: item.booking.checkOutDate,
//         deposit: item.booking.deposit,
//         serviceCharge: item.booking.serviceCharge,
//         roomCharge: item.booking.roomCharge,
//         discount: item.booking.discount,
//         VAT: parseInt(
//           (
//             item.booking.totalPrice -
//             item.booking.totalPrice / (item.booking.VAT / 100 + 1)
//           ).toFixed()
//         ),
//         totalPrice: item.booking.totalPrice,
//         paidOut: item.paidOut,
//         refund: item.refund,
//       };
//       invoiceRevenue.push(invoice);
//     });

//     const groupByMonth = _.groupBy(allBookings, (instance) => {
//       return moment(new Date(instance.createdAt)).format('MMM');
//     });

//     const groupByDay = _.groupBy(allBookings, (instance) => {
//       return moment(new Date(instance.createdAt)).format('dddd');
//     });

//     // FOREACH
//     _.forEach(monthNames, (value) => {
//       if (groupByMonth[value] !== undefined) {
//         let newItem = { month: value, amount: groupByMonth[value].length };
//         map_month.push(newItem);
//       }
//     });

//     _.forEach(allBookings, (booking) => {
//       _.forEach(booking.rooms, (room) => {
//         let newRoom = { type: room.roomType };
//         map_room_status.push(newRoom);
//       });
//     });

//     _.forEach(dayNames, (value) => {
//       if (groupByDay[value] !== undefined) {
//         let newItem = { day: value, amount: groupByDay[value].length };
//         map_booking_day.push(newItem);
//       }
//     });

//     // USER
//     _.forEach(receipts, (item) => {
//       let newItem = {
//         name: item.booking.customer.name,
//         total: item.booking.totalPrice + item.booking.deposit,
//       };
//       map_user.push(newItem);
//     });

//     const users = map_user.reduce((acc, item) => {
//       let existItem = acc.find(({ name }) => item.name === name);
//       if (existItem) {
//         existItem.total += item.total;
//       } else {
//         acc.push(item);
//       }
//       return acc;
//     }, []);

//     // ROOMS

//     _.forEach(receipts, (instance) => {
//       let rooms = [];
//       let dayDiff = toolRoom.getNumberOfDays(
//         instance.booking.checkInDate,
//         instance.booking.checkOutDate
//       );
//       _.forEach(instance.booking.rooms, (item) => {
//         let newRoom = {
//           room: item.roomNumber,
//           type: item.roomType,
//           price: item.price * dayDiff,
//           additional: 0,
//           checkInDate: instance.booking.checkInDate,
//           checkOutDate: instance.booking.checkOutDate,
//         };
//         rooms.push(newRoom);
//       });
//       _.forEach(rooms, (item) => map_room.push(item));
//     });

//     const rooms = Object.values(
//       map_room.reduce((r, { room, price, type }) => {
//         if (r[room] !== undefined) {
//           r[room].count++;
//           r[room].totalPrice += price;
//         } else
//           r[room] = {
//             room,
//             type,
//             count: 1,
//             totalPrice: price,
//           };

//         return r;
//       }, {})
//     );

//     // STATUS'S ROOM ARRAY
//     const statusRoom = Object.values(
//       map_room_status.reduce((r, { type }) => {
//         if (r[type] !== undefined) {
//           r[type].count++;
//         } else r[type] = { type, count: 1 };
//         return r;
//       }, {})
//     );
//     // SERVICE
//     _.forEach(receipts, (instance) => {
//       let services = [];
//       _.forEach(instance.booking.services, (item) => {
//         let newService = {
//           service: item.name,
//           price: item.price,
//           bookingId: instance.booking.code,
//           checkOutDate: instance.booking.checkOutDate,
//         };
//         services.push(newService);
//       });
//       _.forEach(services, (item) => map_service.push(item));
//     });

//     const services = Object.values(
//       map_service.reduce((r, { service, price }) => {
//         if (r[service] !== undefined) {
//           r[service].count++;
//           r[service].totalPrice += price;
//         } else r[service] = { service, count: 1, totalPrice: price };
//         return r;
//       }, {})
//     );

//     const statistic = {
//       totalRevenue,
//       invoiceRevenue,
//       map_booking_day,
//       map_month,
//       map_room,
//       map_service,
//       users,
//       rooms,
//       services,
//       statusRoom,
//     };

//     res.json({
//       success: true,
//       statistic,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

module.exports = {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
};
