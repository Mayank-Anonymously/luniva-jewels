const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const ProductRouter = require("./Routes/ProductRoute");
require("dotenv").config({
  path: "./applicationProperties.env",
});
require("./Config/DBconnection");
const PORT = process.env.PORT;
const path = require("path");
const filePath = path.join("/tmp/images");

const CateRouter = require("./Routes/Category");
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "PUT", "PATCH"],

  allowedHeaders: ["*"],
};

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors(corsOpts));
/* API ENPOINTS */
app.use("/", ProductRouter);
app.use("/", CateRouter);
/* API ENPOINTS */

/* --------------------------------------------------------------------------------------------------- */

/* IMAGE ENPOINT */
app.use(
  "/resources",
  express.static(path.join(path.resolve(), __dirname, "images"))
);
/* IMAGE ENPOINT */

app.listen(PORT, () => {
  console.log(`the port is ready to listen on port ${PORT}`);
});
