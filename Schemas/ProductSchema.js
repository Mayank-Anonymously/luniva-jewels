const mongoose = require('mongoose');
const mongooseSerial = require('mongoose-serial');
var autoIncrement = require('mongoose-auto-increment');

const ProductSchema = new mongoose.Schema(
	{
		ProductId: String,
		title: String,
		description: String,
		price: Number,
		priceSale: Number,
		image: String,
		categoryId: String,
		categoryName: String,
		productSku: String,
		productCode: String,
		quantity: String,
		inStock: Boolean,
		stockQuantity: String,
	},
	{ timestamps: true }
);
autoIncrement.initialize(mongoose.connection);
ProductSchema.plugin(mongooseSerial, {
	field: 'ProductId',
	digits: 2,
});

const Product = new mongoose.model('Products', ProductSchema);
module.exports = Product;
