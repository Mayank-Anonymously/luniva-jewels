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
		const { userId, shippingAddress, billingAddress, paymentMethod } = req.body;

		// Get user and populate cart with product details
		const user = await User.findById(userId).populate('cart.product');

		if (!user || user.cart.length === 0) {
			return res.status(400).json({ message: 'Cart is empty' });
		}

		// Build order items
		const items = user.cart.map((item) => ({
			product: item.product._id,
			quantity: item.quantity,
			price: item.product.price,
		}));

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

		const { amount } = req.body;
		const merchantOrderId = '000001';

		// Build payment request
		const request = StandardCheckoutPayRequest.builder()
			.merchantOrderId(merchantOrderId)
			.amount(amount * 100) // ₹ → paise
			.redirectUrl('https://www.merchant.com/redirect')

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
