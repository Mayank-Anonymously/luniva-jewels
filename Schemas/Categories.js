const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const mongooseSerial = require("mongoose-serial");

const CategoriesSchema = new mongoose.Schema(
  {
    CategoryID: String,
    CategoryName: String,
    CategoryDescription: String,
    // SubCategory: [
    //   {
    //     subCatId: String,
    //     subCategoryName: String,
    //     subSubCategory: [
    //       {
    //         id: String,
    //         name: String,
    //       },
    //     ],
    //   },
    // ],
    SubCategory: [],
    catImage: String,
  },
  { timestamps: true }
);
autoIncrement.initialize(mongoose.connection);
CategoriesSchema.plugin(mongooseSerial, {
  field: "CategoryID",
  digits: 2,
});

const Categories = new mongoose.model("Categories", CategoriesSchema);
module.exports = Categories;
