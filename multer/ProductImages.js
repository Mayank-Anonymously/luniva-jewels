const multer = require("multer");
var { existsSync, mkdirSync } = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "images/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploadProductImage = multer({
  storage: storage,
}).single("image");
module.exports = uploadProductImage;
