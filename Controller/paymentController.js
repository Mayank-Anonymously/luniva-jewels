const { randomUUID } = require('crypto');
const {
	StandardCheckoutClient,
	Env,
	MetaInfo,
	StandardCheckoutPayRequest,
	StandardCheckoutStatusRequest,
} = require('pg-sdk-node');
const { default: OrderSchema } = require('../Schemas/OrderSchema');
const User = require('../Schemas/userSchema');

// 🔑 Config (replace with your credentials)
const clientId = 'SU2509231148396759558422';
const clientSecret = 'e4d9b7bb-d236-4304-a177-d0906e244eb3';
const clientVersion = '1'; // usually "1.0"
const env = Env.PRODUCTION; // change to Env.PRODUCTION for live

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

		await user.save();
		const merchantOrderId = order.orderId;

		// Build payment request
		const request = StandardCheckoutPayRequest.builder()
			.merchantOrderId(merchantOrderId)
			.amount(amount * 100) // ₹ → paise
			.redirectUrl(
				`https://lunivajewels.com/order/payment-status/${merchantOrderId}`
			)

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
		const { merchantOrderId } = req.params;
		console.log(merchantOrderId);
		if (!merchantOrderId) {
			return res.status(400).json({ message: 'merchantOrderId is required' });
		}

		// ✅ Directly get order status using SDK
		const statusResponse = await client.getOrderStatus(merchantOrderId);

		console.log('📦 PhonePe status response:', statusResponse);

		// ✅ Update status in DB
		const order = await OrderSchema.findOne({ orderId: merchantOrderId });
		if (order) {
			order.status = statusResponse.state; // Usually: SUCCESS / FAILURE / PENDING
			await order.save();
		}

		// ✅ Send success response
		res.status(200).json({
			message: 'Payment status fetched successfully',
			status: statusResponse.state,
			raw: statusResponse,
		});
	} catch (err) {
		console.error('❌ Payment status check failed:', err);
		res.status(500).json({ error: 'Payment status check failed' });
	}
};
