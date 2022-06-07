const _ = require('lodash');
const Service = require('../models/Service');

exports.calculateServiceCharge = async (list, type) => {
  let price = 0;
  const listService = await Service.find({
    isDeleted: false,
    isProduct: type === 'product' ? true : false,
  });
  list.forEach((element) => {
    switch (type) {
      case 'service':
        {
          const service = listService.find(
            (x) => x._id.toString() === element.service
          );
          if (service) {
            price += service.price * element.amount;
          }
        }
        break;
      case 'product':
        {
          const product = listService.find(
            (x) => x._id.toString() === element.product
          );
          if (product) {
            price += product.price * element.amount;
          }
        }
        break;
      default:
        break;
    }
  });

  return price;
};

const getAllInfoService = async (list) => {
  const promise = list.map((serviceId) => {
    return Service.findById(serviceId).select('name price');
  });
  return await Promise.all(promise);
};

exports.getAllInfoService = getAllInfoService;
