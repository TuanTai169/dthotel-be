const Convenience = require('../models/Convenience');

const createConvenience = async (req, res) => {
  const { name, desc } = req.body;

  //Validation
  if (!name)
    return res.status(400).json({
      success: false,
      message: 'Name are required',
    });
  try {
    //Check for existing convenience
    const convenienceExist = await Convenience.findOne({
      name,
      desc,
    });
    if (convenienceExist)
      return res.status(400).json({
        success: false,
        message: 'Convenience already taken',
      });
    //All good
    const newConvenience = new Convenience({
      name,
      desc,
    });

    await newConvenience.save();
    res.json({
      success: true,
      message: 'Convenience created successfully',
      newConvenience,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllConveniences = async (req, res) => {
  try {
    const conveniences = await Convenience.find({ isDeleted: false }).select(
      '-createdAt -updatedAt '
    );
    res.json({
      success: true,
      conveniences,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getConvenienceById = async (req, res) => {
  try {
    const convenience = await Convenience.findById(req.params.id).select(
      '-createdAt -updatedAt '
    );
    if (!convenience)
      res.json({
        success: false,
        message: 'Convenience not found',
      });
    res.json({
      success: true,
      convenience,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateConvenience = async (req, res) => {
  const { name, desc } = req.body;
  const id = req.params.id;
  try {
    const convenienceExist = await Convenience.findOne({
      name,
    });

    if (convenienceExist && convenienceExist?._id.toString() !== id)
      return res.status(400).json({
        success: false,
        message: 'Convenience already taken',
      });
    //All good
    let updateConvenience = {
      name,
      desc,
    };

    const convenienceUpdatedCondition = { _id: id };
    let updatedConvenience = await Convenience.findOneAndUpdate(
      convenienceUpdatedCondition,
      updateConvenience,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Convenience updated successfully',
      updatedConvenience,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteConvenience = async (req, res) => {
  try {
    const convenienceDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedConvenience = await Convenience.findOneAndUpdate(
      convenienceDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Convenience deleted successfully',
      deletedConvenience,
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
  createConvenience,
  getAllConveniences,
  getConvenienceById,
  updateConvenience,
  deleteConvenience,
};
