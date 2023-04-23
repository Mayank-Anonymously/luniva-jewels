const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "images/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploadCategoryImage = multer({
  storage: storage,
}).single("image");
module.exports = uploadCategoryImage;
