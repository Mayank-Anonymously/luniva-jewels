const express = require("express");
const { AddToCart, GetAllItems } = require("../Controller/Cart");

const CartRoutes = express.Router();

CartRoutes.get("/getAllCartItems", GetAllItems);
CartRoutes.post("/addItemsToCart", AddToCart);
// CartRoutes.get("/getCartItemById/:itemId", GetCategoryByID);
// CartRoutes.put("/deleteCategory/:categoryID", DeleteCategoryByID);
// CartRoutes.patch("/updateCategory/:categoryID", UpdateCategory);

module.exports = CartRoutes;
