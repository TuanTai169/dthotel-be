// VALIDATION
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

//Create User Validation
const userValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(10).required().email(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().min(10),
    address: Joi.string(),
    role: Joi.string(),
    image: Joi.object(),
  });
  return schema.validate(data);
};

//Create Customer Validation
const customerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6),
    email: Joi.string().min(10).email(),
    phone: Joi.string().min(10).max(10),
    idNumber: Joi.string().min(9).max(12),
    address: Joi.string(),
    numberOfPeople: Joi.object(),
  });
  return schema.validate(data);
};
//Create Room Validation
const roomValidation = (data) => {
  const schema = Joi.object({
    roomNumber: Joi.string().required().min(3),
    floor: Joi.number().required(),
    name: Joi.string(),
    price: Joi.number().required(),
    capacity: Joi.object(),
    detail: Joi.object(),
    roomType: Joi.objectId(),
    bed: Joi.object(),
    convenience: Joi.array(),
    status: Joi.string(),
    images: Joi.array(),
  });
  return schema.validate(data);
};

//Create Room Validation
const receiptValidation = (data) => {
  const schema = Joi.object({
    booking: Joi.objectId(),
    paidOut: Joi.number().required().min(0),
    refund: Joi.number(),
    modeOfPayment: Joi.string(),
  });
  return schema.validate(data);
};
module.exports.userValidation = userValidation;
module.exports.customerValidation = customerValidation;
module.exports.roomValidation = roomValidation;
module.exports.receiptValidation = receiptValidation;
