const mongoose = require("mongoose");

const DATABASE_URL =
  "mongodb+srv://asfiyakhank1:asfiya123@art-shop.tihlbtz.mongodb.net/Asfiya-Art-Shop?retryWrites=true&w=majority";
// const DATABASE_URL =
//   "mongodb+srv://Architecture:Architecture12@architecture.lxzym0j.mongodb.net/Architecture?retryWrites=true&w=majority";
mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", function (error) {
  console.log(error);
});

mongoose.connection.on("open", function () {
  console.log("Connected to MongoDB database.");
});
