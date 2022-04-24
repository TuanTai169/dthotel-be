const Type = require('../models/TypeOfRoom');

const createType = async (req, res) => {
  const { nameTag, type } = req.body;

  //Validation
  if (!nameTag || !type)
    return res.status(400).json({
      success: false,
      message: 'Name Tag and Type of room are required',
    });
  try {
    //Check for existing type

    const typeExist = await Type.findOne({ nameTag });
    if (typeExist)
      return res.status(400).json({
        success: false,
        message: 'This type already existed',
      });
    //All good
    const newType = new Type({
      nameTag,
      type,
    });

    await newType.save();
    res.json({
      success: true,
      message: 'Type created successfully',
      newType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllTypes = async (req, res) => {
  try {
    const types = await Type.find({ isDeleted: false }).select(
      '-createdAt -updatedAt '
    );
    res.json({
      success: true,
      types,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getTypeById = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type)
      res.status(401).json({
        success: false,
        message: 'Type not found',
      });
    res.json({
      success: true,
      type,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateType = async (req, res) => {
  const { nameTag, type } = req.body;
  const id = req.params.id;

  //Validation
  if (!nameTag || !type)
    return res.status(400).json({
      success: false,
      message: 'Name Tag and Type of room are required',
    });
  try {
    const typeExist = await Type.findOne({ nameTag, type });
    if (typeExist && typeExist?._id.toString() !== id)
      return res.status(400).json({
        success: false,
        message: 'This type already existed',
      });
    //All good
    let updateType = {
      nameTag,
      type,
    };
    const typeUpdatedCondition = { _id: id };

    const updatedType = await Type.findOneAndUpdate(
      typeUpdatedCondition,
      updateType,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Type updated successfully',
      updatedType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteType = async (req, res) => {
  try {
    const typeDeleteCondition = { _id: req.params.id };
    const deleted = { isDeleted: true };
    let deletedType = await Type.findOneAndUpdate(
      typeDeleteCondition,
      deleted,
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: 'Type deleted successfully',
      deletedType,
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
  createType,
  getAllTypes,
  getTypeById,
  updateType,
  deleteType,
};
