const {
	StandardCheckoutClient,
	Env,
	MetaInfo,
	StandardCheckoutPayRequest,
	StandardCheckoutStatusRequest,
} = require('pg-sdk-node');
const { default: OrderSchema } = require('../Schemas/OrderSchema');
const User = require('../Schemas/userSchema');
const nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config({
	path: '../applicationProperties.env',
});
// 🔑 Config (replace with your credentials)
const clientId = 'SU2509231148396759558422';
const clientSecret = 'e4d9b7bb-d236-4304-a177-d0906e244eb3';
const clientVersion = '1'; // usually "1.0"
const env = Env.PRODUCTION; // change to Env.PRODUCTION for live

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false, // true for 465, false for 587
	auth: {
		user: process.env.SMTP_USER, // your email
		pass: process.env.SMTP_PASS, // your app password
	},
});

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
exports.sendInvoiceMail = async (req, res) => {
	try {
		const { user, order } = req.body;

		const itemsHTML = order.items
			.map(
				(item, i) => `
				<tr>
					<td style="border:1px solid #ddd; padding:8px; text-align:center;">${i + 1}</td>
					<td style="border:1px solid #ddd; padding:8px;">${item.title}</td>
					<td style="border:1px solid #ddd; padding:8px; text-align:center;">₹${
						item.priceSale
					}</td>
					<td style="border:1px solid #ddd; padding:8px; text-align:center;">${
						item.quantity
					}</td>
					<td style="border:1px solid #ddd; padding:8px; text-align:center;">₹${
						item.priceSale * item.quantity
					}</td>
				</tr>
			`
			)
			.join('');

		const html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Invoice - Luniva Jewels</title>
		</head>
		<body style="margin:0; padding:0; background-color:#f7f7f7; font-family:Arial, Helvetica, sans-serif; color:#333;">
			<div style="max-width:800px; margin:20px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1); padding:30px;">
				
				<!-- Header -->
				<div style="border-bottom:2px solid #800000; padding-bottom:10px; display:flex; justify-content:space-between; flex-wrap:wrap;">
					<div>
						<h2 style="color:#800000; font-size:28px; font-weight:700; margin:0;">LUNIVA</h2>
						<p style="margin:5px 0 0 0; font-weight:bold;">Luniva Jewels</p>
						<p style="margin:0; font-size:14px; line-height:1.5;">
							F-780, Kamla Nagar, Agra-282005<br />
							+91 70557 01906 | +91 89232 50822<br />
							<a href="mailto:info@lunivajewels.com" style="color:#800000; text-decoration:none;">info@lunivajewels.com</a>
						</p>
					</div>
					<div style="text-align:right;">
						<h4 style="color:#800000; margin:0;">INVOICE #${order.orderId}</h4>
						<p style="margin:0; font-size:14px;">Date: ${moment(order.createdAt).format(
							'DD/MM/YYYY'
						)}</p>
					</div>
				</div>

				<!-- Billing Info -->
				<div style="margin-top:20px;">
					<h4 style="margin:0 0 5px 0; color:#800000;">Invoice To:</h4>
					<p style="margin:0; font-size:14px; line-height:1.6;">
						<strong>${user.name}</strong><br />
						${order?.shippingAddress?.street}, ${order?.shippingAddress?.city}, ${
			order?.shippingAddress?.state
		}, ${order?.shippingAddress?.zip}, India<br />
						<a href="mailto:${user.email}" style="color:#800000; text-decoration:none;">${
			user.email
		}</a>
					</p>
				</div>

				<!-- Items Table -->
				<table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:14px;">
					<thead>
						<tr style="background-color:#800000; color:#fff;">
							<th style="border:1px solid #800000; padding:8px;">#</th>
							<th style="border:1px solid #800000; padding:8px; text-align:left;">Item</th>
							<th style="border:1px solid #800000; padding:8px;">Price</th>
							<th style="border:1px solid #800000; padding:8px;">Qty</th>
							<th style="border:1px solid #800000; padding:8px;">Total</th>
						</tr>
					</thead>
					<tbody>
						${itemsHTML}
					</tbody>
				</table>

				<!-- Totals -->
				<table style="width:100%; margin-top:20px; font-size:14px;">
					<tr>
						<td style="text-align:right; padding:5px 8px;"><strong>Subtotal:</strong></td>
						<td style="text-align:right; padding:5px 8px;">₹${order.total}</td>
					</tr>
					<tr>
						<td style="text-align:right; padding:5px 8px;"><strong>Tax:</strong></td>
						<td style="text-align:right; padding:5px 8px;">Inclusive (GST & Shipping)</td>
					</tr>
					<tr>
						<td style="text-align:right; padding:5px 8px; color:#800000; font-weight:bold;"><strong>Grand Total:</strong></td>
						<td style="text-align:right; padding:5px 8px; color:#800000; font-weight:bold;">₹${
							order.total
						}</td>
					</tr>
				</table>

				<!-- Footer -->
				<div style="margin-top:30px; text-align:center;">
					<h3 style="color:#800000; font-weight:600; margin-bottom:10px;">Thank you for your purchase!</h3>
					<p style="font-size:13px; color:#666;">Invoice generated automatically by Luniva Jewels.</p>
				</div>
			</div>
		</body>
		</html>`;

		await transporter.sendMail({
			from: `"Luniva Jewels" <${process.env.SMTP_USER}>`,
			to: user.email,
			subject: `Invoice #${order.orderId} - Thank you for your order`,
			html,
		});

		return res.json({
			success: true,
			message: 'Invoice email sent successfully',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: err.message });
	}
};
