const mongoose = require("mongoose");
const mongooseSerial = require("mongoose-serial");
var autoIncrement = require("mongoose-auto-increment");

const AddPackagesSchema = new mongoose.Schema({
  packId: String,
  name: String,
  description: String,
  price: Number,
});
autoIncrement.initialize(mongoose.connection);

AddPackagesSchema.plugin(mongooseSerial, {
  field: "packId",
  digits: 1,
});
const addpackSchema = new mongoose.model("Packages", AddPackagesSchema);
module.exports = addpackSchema;
