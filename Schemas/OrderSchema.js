import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	phone: { type: String, required: true },
	street: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	postalCode: { type: String, required: true },
	country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: [
		{
			product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
			quantity: { type: Number, required: true },
			price: { type: Number, required: true },
		},
	],
	total: { type: Number, required: true },
	shippingAddress: { type: addressSchema, required: true },
	billingAddress: { type: addressSchema, required: true },
	paymentMethod: { type: String, required: true }, // e.g., COD, Card, UPI
	status: { type: String, default: 'Pending' },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
