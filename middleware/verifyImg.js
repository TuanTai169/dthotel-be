const fs = require('fs');

const verifyImage = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      return res
        .status(400)
        .json({ success: false, message: 'No files were uploaded.' });

    const file = req.files.file;

    if (file.size > 1024 * 1024 * 5) {
      removeTmp(file.tempFilePath);
      return res
        .status(400)
        .json({ success: false, message: 'Size too large.' });
    } //< 5MB

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      removeTmp(file.tempFilePath);
      return res
        .status(400)
        .json({ success: false, message: 'File format is incorrect.' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = verifyImage;
