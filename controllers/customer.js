const Customer = require('../models/Customer');

const { customerValidation } = require('../tools/validation');
const { capacityDefault } = require('../config/constants');

const getAllCustomer = async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: false }).select(
      '-createdAt -updatedAt'
    );
    res.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      res.status(400).json({
        success: false,
        message: 'Customer not found',
      });
    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const createCustomer = async (req, res) => {
  const { name, email, phone, idNumber, address, numberOfPeople } = req.body;

  //Validation
  const { error } = customerValidation(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  try {
    //Check for existing customer
    const customerExist = await Customer.findOne({ email });
    if (customerExist)
      return res.status(400).json({
        success: false,
        message: 'Email already existed',
      });

    //All good
    const newCustomer = new Customer({
      name,
      email,
      phone,
      idNumber,
      address,
      numberOfPeople,
    });

    await newCustomer.save();

    res.json({
      success: true,
      message: 'Customer created successfully',
      newCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateCustomer = async (req, res) => {
  const { name, email, phone, idNumber, address, numberOfPeople } = req.body;
  const id = req.params.id;
  try {
    //Check for existing customer
    const customerExist = await Customer.findOne({ email });
    if (customerExist && customerExist?.id !== id)
      return res.status(400).json({
        success: false,
        message: 'Email already existed',
      });

    //All good
    let updateCustomer = {
      name,
      email,
      phone,
      idNumber,
      address,
      numberOfPeople,
    };

    const cusUpdatedCondition = { _id: id };

    let updatedCustomer = await Customer.findOneAndUpdate(
      cusUpdatedCondition,
      updateCustomer,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      updatedCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customerDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedCus = await Customer.findOneAndUpdate(
      customerDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      deletedCus,
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
  getAllCustomer,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
