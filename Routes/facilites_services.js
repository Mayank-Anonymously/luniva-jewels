const express = require("express");
const {
  AddServices,
  GetAllServices,
  updateServices,
  deleteService,
} = require("../Controller/facilities_and_services");
const Router = express.Router();

Router.post("/addServices", AddServices);
Router.get("/getAllServices", GetAllServices);
Router.put("/deleteService/:serviceId", deleteService);
Router.patch("/updateService/:serviceId", updateServices);

module.exports = Router;
