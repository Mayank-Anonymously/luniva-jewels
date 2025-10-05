import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

// Initialize autoIncrement
autoIncrement.initialize(mongoose.connection);

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
	orderNumber: { type: Number, unique: true }, // auto-increment numeric field
	orderId: { type: String, unique: true }, // formatted ID
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: Array,
	total: { type: Number, required: true },
	shippingAddress: { type: addressSchema, required: true },
	billingAddress: { type: addressSchema, required: true },
	paymentMethod: { type: String, required: true },
	status: { type: String, default: 'Pending' },
	createdAt: { type: Date, default: Date.now },
});

// Attach auto-increment plugin
orderSchema.plugin(autoIncrement.plugin, {
	model: 'Order',
	field: 'orderNumber',
	startAt: 1,
	incrementBy: 1,
});

// Setter to automatically format orderId whenever orderNumber is set
orderSchema.path('orderNumber').set(function (value) {
	// Only set orderId if value exists (to avoid undefined issues)
	if (value != null) {
		this.orderId = value.toString().padStart(5, '0'); // 00001, 00002, ...
	}
	return value;
});

export default mongoose.model('Order', orderSchema);
