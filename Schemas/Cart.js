const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const CartSchema = new mongoose.Schema(
	{
		userId: String,
		title: String,
		description: String,
		price: Number,
		priceSale: Number,
		image: Array,
		categoryId: String,
		categoryName: String,
		productSku: String,
		productCode: String,
		inStock: Boolean,
		quantity: String,
		stockQuantity: String,
		id: String,
	},
	{ timestamps: true }
);
autoIncrement.initialize(mongoose.connection);

const Cart = new mongoose.model('Cart', CartSchema);
module.exports = Cart;
