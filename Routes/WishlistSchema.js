const express = require('express');
const {
	AddToWishlist,
	RemoveFromWishlist,
	GetAllItemsById,
} = require('../Controller/wishlistController');
const { GetAllItems } = require('../Controller/Cart');

const WishlistRouter = express.Router();

WishlistRouter.post('/addItemsToWishlist', AddToWishlist);
WishlistRouter.get('/getAllWishlistItems', GetAllItems);
WishlistRouter.get('/getWishlistItemById/:userId', GetAllItemsById);
WishlistRouter.put('/removeItemFromWishlist/:userId/:id', RemoveFromWishlist);
// WishlistRouter.patch("/updateCategory/:categoryID", UpdateCategory);

module.exports = WishlistRouter;
