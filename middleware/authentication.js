const User = require('../models/User');
const { userRoles } = require('../config/constants');

// ADMIN
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (
      user.role === userRoles.Employee.name ||
      user.role === userRoles.Manager.name
    )
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to make this request',
      });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//MANAGER
const checkManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === userRoles.Employee.name)
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to make this request',
      });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
module.exports = { checkAdmin, checkManager };
