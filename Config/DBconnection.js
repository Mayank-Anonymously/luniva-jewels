const mongoose = require("mongoose");

require("dotenv").config({
  path: "./applicationProperties.env",
});

const uri = process.env.DATABASE;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => {
    console.log("DB Is connected");
  })
  .catch((err) => {
    console.log(err);
  });
