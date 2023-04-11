const mongoose = require("mongoose");

require("dotenv").config({
  path: "./applicationProperties.env",
});

const uri = process.env.DATABASE;
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://asfiyakhank1:asfiya123@art-shop.tihlbtz.mongodb.net/Asfiya-Art-Shop?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB Is connected");
  })
  .catch((err) => {
    console.log(err);
  });
