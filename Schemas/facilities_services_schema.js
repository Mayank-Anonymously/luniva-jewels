const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const mongooseSerial = require("mongoose-serial");
const ServicesSchema = new mongoose.Schema({
  id: String,
  serviceName: String,
  serviceDescription: String,
  subServices: [
    {
      subServiceID: String,
      subServiceName: String,
      subServiceDescription: String,
    },
  ],
  serviceRating: Number,
  servicePrice: Number,
});
autoIncrement.initialize(mongoose.connection);
ServicesSchema.plugin(mongooseSerial, {
  field: "id",
  digits: 2,
});
const Services = new mongoose.model("Services And Facilities", ServicesSchema);
module.exports = Services;
