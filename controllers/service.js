const Booking = require('../models/Booking');
const Service = require('../models/Service');

const createService = async (req, res) => {
  const { name, price, isProduct } = req.body;

  //Validation
  if (!name || !price)
    return res.status(400).json({
      success: false,
      message: 'Name and price of service are required',
    });
  try {
    //Check for existing service
    const serviceExist = await Service.findOne({ name, isDeleted: false });
    if (serviceExist)
      return res.status(400).json({
        success: false,
        message: 'Service or product already taken',
      });
    //All good
    const newService = new Service({
      name,
      price,
      isProduct,
    });

    const typeName = !isProduct ? 'Service' : 'Product';

    await newService.save();
    res.json({
      success: true,
      message: `${typeName} created successfully`,
      service: newService,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isDeleted: false });
    res.json({
      success: true,
      services,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      res.json({
        success: false,
        message: 'Service not found',
      });
    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateService = async (req, res) => {
  const { name, price } = req.body;

  //Validation
  if (!name || !price)
    return res.status(400).json({
      success: false,
      message: 'Name and price of service are required',
    });

  try {
    //All good
    let updateService = {
      name: name,
      price: price,
    };
    const serviceUpdatedCondition = { _id: req.params.id };

    updatedService = await Service.findOneAndUpdate(
      serviceUpdatedCondition,
      updateService,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Service updated successfully',
      updatedService,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteService = async (req, res) => {
  const id = req.params.id;
  try {
    const bookings = await Booking.find({ isDeleted: false });
    const listService = [];
    bookings.forEach((b) => {
      if (Array.isArray(b.services) && b.services.length > 0) {
        b.services.forEach((element) => {
          listService.push(element.service.toString());
        });
      }
      if (Array.isArray(b.products) && b.products.length > 0) {
        b.products.forEach((element) => {
          listService.push(element.product.toString());
        });
      }
    });

    if (listService.includes(id)) {
      return res.status(400).json({
        success: false,
        message: 'Service is being used',
      });
    }

    const serviceDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedService = await Service.findOneAndUpdate(
      serviceDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Service deleted successfully',
      deletedService,
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
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
