import Counter from './Counter,js';
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
	name: { type: String, required: true },
	phone: { type: String, required: true },
	street: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	zip: { type: String, required: true },
	country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
	orderId: { type: String, unique: true }, // auto-generated sequential ID
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: Array,
	total: { type: Number, required: true },
	shippingAddress: { type: addressSchema, required: true },
	billingAddress: { type: addressSchema, required: true },
	paymentMethod: { type: String, required: true },
	status: { type: String, default: 'Pending' },
	createdAt: { type: Date, default: Date.now },
});

// Pre-save hook for auto-increment orderId
orderSchema.pre('save', async function (next) {
	if (this.isNew) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: 'orderId' }, // counter document for orders
			{ $inc: { seq: 1 } }, // increment sequence
			{ new: true, upsert: true } // create if not exists
		);

		// Format with leading zeros → 00001, 00002, etc.
		this.orderId = counter.seq.toString().padStart(5, '0');
	}
	next();
});

export default mongoose.model('Order', orderSchema);
