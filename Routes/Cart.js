const express = require('express');
const {
	AddToCart,
	GetAllItems,
	RemoveFromCart,
	ClearCart,
} = require('../Controller/Cart');
const uploadProductImage = require('../multer/ProductImages');

const CartRoutes = express.Router();

CartRoutes.post('/addItemsToCart', AddToCart);
CartRoutes.get('/getAllCartItems/:userId', GetAllItems);
// CartRoutes.get("/getCartItemById/:itemId", GetCategoryByID);
CartRoutes.put('/removeItemFromCart/:userId/:id', RemoveFromCart);
CartRoutes.get('/empty-cart/:userId', ClearCart);

// CartRoutes.patch("/updateCategory/:categoryID", UpdateCategory);

module.exports = CartRoutes;
