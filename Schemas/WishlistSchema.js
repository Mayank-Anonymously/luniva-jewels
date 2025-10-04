const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const WishlistSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		price: Number,
		priceSale: Number,
		image: String,
		categoryId: String,
		categoryName: String,
		productSku: String,
		productCode: String,
		inStock: Boolean,
		quantity: String,
		stockQuantity: String,
		id: String,
		_id: String,
	},
	{ timestamps: true }
);
autoIncrement.initialize(mongoose.connection);

const Wishlist = new mongoose.model('Wishlist', WishlistSchema);
module.exports = Wishlist;
