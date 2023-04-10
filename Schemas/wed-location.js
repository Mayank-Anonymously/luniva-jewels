const mongoose = require("mongoose");
const mongooseSerial = require("mongoose-serial");
var autoIncrement = require("mongoose-auto-increment");

const locations = new mongoose.Schema({
  placeName: String,
  placeAddress: String,
  placeState: String,
  placePincode: Number,
});
autoIncrement.initialize(mongoose.connection);

const locationSchema = new mongoose.model("Serving-locations", locations);
module.exports = locationSchema;
