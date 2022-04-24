const _ = require("lodash")
const Service = require("../models/Service")

exports.calculateServiceCharge = async (services) => {
  const listService = await getAllInfoService(services)
  return _.sumBy(listService, (item) => item.price)
}

const getAllInfoService = async (services) => {
  const promise = services.map((service) => {
    return Service.findById(service)
  })
  return await Promise.all(promise)
}
