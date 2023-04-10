const mongoose = require("mongoose");
const mongooseSerial = require("mongoose-serial");
var autoIncrement = require("mongoose-auto-increment");

const ProductSchema = new mongoose.Schema({
  // productId: String,
  title: String,
  description: String,
  price: Number,
  priceSale: Number,
  image: String,
  categoryId: Number,
  categoryName: String,
  productSku: String,
  productCode: String,
  inStock: Boolean,
});
// autoIncrement.initialize(mongoose.connection);
// ProductSchema.plugin(mongooseSerial, {
//   field: "productId",
//   digits: 2,
// });

const Product = new mongoose.model("Products", ProductSchema);
module.exports = Product;
