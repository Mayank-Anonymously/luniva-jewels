const express = require("express");
const {
  AddNewLocation,
  GetAllLocations,
  GetAllLocationsById,
  DeleteLocation,
  UpdateLoction,
} = require("../Controller/wed_locations");
const Router = express.Router();

Router.post("/AddLocations", AddNewLocation);
Router.get("/getAllLocation", GetAllLocations);
Router.get("/getLocationsById/:locationID", GetAllLocationsById);
Router.patch("/updateLocationById/:locationID", UpdateLoction);
Router.put("/deleteLocation/:locationID", DeleteLocation);

module.exports = Router;
