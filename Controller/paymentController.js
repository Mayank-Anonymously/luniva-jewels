const { randomUUID } = require('crypto');
const {
	StandardCheckoutClient,
	Env,
	MetaInfo,
	StandardCheckoutPayRequest,
} = require('pg-sdk-node');
const { default: OrderSchema } = require('../Schemas/OrderSchema');
const User = require('../Schemas/userSchema');

// 🔑 Config (replace with your credentials)
const clientId = 'TEST-M23QLXBFIKYTQ_25092';
const clientSecret = 'NzVlYWE1ZjMtYzFmYS00MWJjLWFkMGQtOWYxOTA4NGRlZjRm';
const clientVersion = '1.0'; // usually "1.0"
const env = Env.SANDBOX; // change to Env.PRODUCTION for live

// Initialize PhonePe client
const client = StandardCheckoutClient.getInstance(
	clientId,
	clientSecret,
	clientVersion,
	env
);

// -------------------
// Initiate Payment
// -------------------
exports.initiatePayment = async (req, res) => {
	try {
		const {
			userId,
			shippingAddress,
			billingAddress,
			paymentMethod,
			amount,
			items,
		} = req.body;

		// Get user and populate cart with product details
		const user = await User.findById(userId);

		if (!user || user.cart.length === 0) {
			return res.status(400).json({ message: 'Cart is empty' });
		}

		// Calculate total
		const total = items.reduce(
			(acc, item) => acc + item.price * item.quantity,
			0
		);

		// Create new order
		const order = new OrderSchema({
			user: userId,
			items,
			total,
			shippingAddress,
			billingAddress,
			paymentMethod,
		});

		await order.save();

		// Clear cart after placing order
		user.cart = [];
		await user.save();

		const merchantOrderId = order.orderId;

		// Build payment request
		const request = StandardCheckoutPayRequest.builder()
			.merchantOrderId(merchantOrderId)
			.amount(amount * 100) // ₹ → paise
			.redirectUrl(`http://localhost:9000/payment-status/${merchantOrderId}`)

			.build();

		const response = await client.pay(request);

		res.json({
			orderId: merchantOrderId,
			checkoutUrl: response.redirectUrl,
		});
	} catch (err) {
		console.error('❌ Payment initiation failed:', err);
		res.status(500).json({ error: 'Payment initiation failed' });
	}
};

exports.checkPaymentStatus = async (req, res) => {
	try {
		const { merchantOrderId } = req.body;

		if (!merchantOrderId) {
			return res.status(400).json({ message: 'merchantOrderId is required' });
		}

		// Build status request
		const statusRequest = StandardCheckoutStatusRequest.builder()
			.merchantOrderId(merchantOrderId)
			.build();

		const statusResponse = await client.status(statusRequest);

		// Update order status in DB
		const order = await Order.findOne({ orderId: merchantOrderId });
		if (order) {
			order.status = statusResponse.status; // SUCCESS / FAILURE / PENDING
			await order.save();
		}

		res.status(200).json(statusResponse);
	} catch (err) {
		console.error('❌ Payment status check failed:', err);
		res.status(500).json({ error: 'Payment status check failed' });
	}
};
