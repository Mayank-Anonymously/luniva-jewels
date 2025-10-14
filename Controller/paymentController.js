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

// ✅ Configure Nodemailer Transporter

exports.sendInvoiceMail = async (req, res) => {
	try {
		const { user, order } = req.body;

		const itemsHTML = order.items
			.map(
				(item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${item.title}</strong></td>
            <td>₹${item.priceSale}</td>
            <td>${item.quantity}</td>
            <td>₹${item.priceSale * item.quantity}</td>
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
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <style>
    body {
      font-family: "Helvetica Neue", Arial, sans-serif;
      background: #f9f9f9;
      padding: 20px;
      color: #333;
    }
    .invoice-box {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
      max-width: 800px;
      margin: auto;
    }
    .brand-name {
      font-size: 2rem;
      font-weight: 700;
      color: #800000;
      letter-spacing: 1.5px;
    }
    .invoice-header {
      border-bottom: 2px solid #800000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .table thead {
      background-color: #800000;
      color: #fff;
    }
    .table th, .table td {
      vertical-align: middle;
      text-align: center;
    }
    .thankyou {
      color: #800000;
      font-weight: bold;
      font-size: 1.3rem;
      text-align: center;
      margin-top: 20px;
    }
    footer {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="invoice-header d-flex justify-content-between align-items-center">
      <div>
        <h2 class="brand-name">LUNIVA</h2>
        <p class="mb-0"><strong>Luniva Jewels</strong></p>
        <small>
          F-780, Kamla Nagar, Agra-282005<br />
          +91 70557 01906 | +91 89232 50822<br />
          <a href="mailto:info@lunivajewels.com" class="text-decoration-none">info@lunivajewels.com</a>
        </small>
      </div>
      <div class="text-end">
        <h5 class="text-uppercase text-danger mb-1">INVOICE #${
					order.orderId
				}</h5>
        <p class="mb-0"><strong>Date:</strong> ${moment(order.createdAt).format(
					'DD/MM/YYYY'
				)}</p>
      </div>
    </div>

    <div class="mb-4">
      <h6 class="fw-bold text-uppercase mb-1">Invoice To:</h6>
      <p class="mb-0">${user.name}<br />
      ${order?.shippingAddress?.street}, ${order?.shippingAddress?.city}, ${
			order?.shippingAddress?.state
		}, ${order?.shippingAddress?.zip}, India<br />
      <a href="mailto:${user.email}">${user.email}</a></p>
    </div>

    <table class="table table-bordered align-middle">
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <div class="row mt-4">
      <div class="col-md-6"></div>
      <div class="col-md-6">
        <table class="table table-borderless">
          <tbody>
            <tr>
              <td class="text-end"><strong>Subtotal:</strong></td>
              <td class="text-end">₹${order.total}</td>
            </tr>
            <tr>
              <td class="text-end"><strong>Tax:</strong></td>
              <td class="text-end">Inclusive (GST & Shipping)</td>
            </tr>
            <tr>
              <td class="text-end fw-bold"><strong>Grand Total:</strong></td>
              <td class="text-end fw-bold text-danger">₹${order.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="thankyou">Thank you for your purchase!</div>
    <footer>Invoice generated automatically by Luniva Jewels.</footer>
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
		console.error('❌ Invoice email error:', err);
		return res.status(500).json({ success: false, message: err.message });
	}
};
