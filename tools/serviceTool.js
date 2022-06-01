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

// const getAllInfoService = async (id) => {
//   return await Promise.all(Service.findById({ _id: id }));
// };
