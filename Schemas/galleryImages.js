const mongoose = require("mongoose");

const GalleryImagesSchema = new mongoose.Schema(
  {
    imageName: String,
    image: String,
  },
  { timestamps: true }
);

const gallery = new mongoose.model("GalleryImage", GalleryImagesSchema);
module.exports = gallery;
