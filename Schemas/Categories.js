const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseSerial = require('mongoose-serial');

// Define SubSubCategory schema (commented out for future use)
// const SubSubCategorySchema = new mongoose.Schema({
// 	id: String,
// 	name: String,
// });

// Define SubCategory schema
const SubCategorySchema = new mongoose.Schema({
	subCategoryName: { type: String, required: true },
	// subSubCategory: [SubSubCategorySchema],
});

// Define main Category schema
const CategoriesSchema = new mongoose.Schema(
	{
		CategoryName: { type: String, required: true },
		CategoryDescription: String,
		SubCategory: [SubCategorySchema],
		catImage: String,
	},
	{ timestamps: true }
);

const Categories = mongoose.model('Categories', CategoriesSchema);
module.exports = Categories;
