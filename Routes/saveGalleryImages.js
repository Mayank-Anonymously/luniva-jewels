const express = require("express");
const {
  AddImages,
  GetAllImages,
  DeleteImagesById,
  GetAllImagesById,
} = require("../Controller/galleryImages");
const uploadToGallery = require("../multer/GalleryMulter");
const Router = express.Router();

Router.get("/getAllImages", GetAllImages);
Router.get("/getImagesById/:imageId", GetAllImagesById);
Router.post("/addImageToGallery", uploadToGallery, AddImages);
Router.put(
  "/deleteImagefromGalleryById/:imageId",
  uploadToGallery,
  DeleteImagesById
);

module.exports = Router;
