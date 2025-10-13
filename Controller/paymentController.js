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
            <td class="no">${i + 1}</td>
            <td class="text-left"><h3>${item.title}</h3></td>
            <td class="unit">₹${item.priceSale}</td>
            <td class="qty">${item.quantity}</td>
            <td class="total">₹${item.priceSale}</td>
          </tr>
        `
			)
			.join('');

		const html = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        ${INVOICE_CSS}
      </style>
    </head>
    <body>
      <div id="invoice">
        <div class="invoice">
          <header>
            <div class="header-flex">
              <div class="logo">
                <img src="https://www.lunivajewels.com/assets/logo.png" alt="Luniva Jewels" style="max-height:60px;">
              </div>
              <div class="company-details">
                <h2 class="name">Luniva Jewels</h2>
                <div>F-780, Kamla Nagar, Agra-282005</div>
                <div>+91 70557 01906 | +91 89232 50822</div>
                <div>info@lunivajewels.com</div>
              </div>
            </div>
          </header>
          <main>
            <div class="contacts">
              <div class="invoice-to">
                <div class="text-gray-light">INVOICE TO:</div>
                <h2 class="to">${user.name}</h2>
                <div class="address">${order?.shippingAddress?.street}, ${
			order?.shippingAddress?.city
		}, ${order?.shippingAddress?.state}, ${
			order?.shippingAddress?.zip
		}, India</div>
                <div class="email"><a href="mailto:${user.email}">${
			user.email
		}</a></div>
              </div>
              <div class="invoice-details">
                <h1 class="invoice-id">INVOICE #${order.orderId}</h1>
                <div class="date">Date of Invoice: ${moment(
									order.createdAt
								).format('DD/MM/YYYY')}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th class="text-left">ITEM</th>
                  <th class="text-right">PRICE</th>
                  <th class="text-right">QTY</th>
                  <th class="text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2"></td>
                  <td colspan="2">SUBTOTAL</td>
                  <td>₹${order.total}</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td colspan="2">Tax</td>
                  <td>Inclusive (GST & Shipping)</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td colspan="2">GRAND TOTAL</td>
                  <td>₹${order.total}</td>
                </tr>
              </tfoot>
            </table>

            <div class="thanks">Thank you for your purchase!</div>
          </main>

          <footer>
            Invoice generated automatically by Luniva Jewels.
          </footer>
        </div>
      </div>
    </body>
    </html>
    `;

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

// --- Responsive Maroon Theme CSS ---
const INVOICE_CSS = `
body {
	margin: 0;
	font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
	background: #f7f7f7;
	color: #333;
}
#invoice {
	padding: 20px;
}
.invoice {
	background: #fff;
	padding: 20px;
	border-radius: 10px;
	max-width: 800px;
	margin: auto;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
header {
	border-bottom: 2px solid #800000;
	padding-bottom: 15px;
	margin-bottom: 20px;
}
.header-flex {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
}
.company-details {
	text-align: right;
}
.invoice-details {
	text-align: right;
	margin-top: 10px;
}
.invoice-to {
	margin-bottom: 15px;
}
.invoice table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 10px;
}
.invoice table th, .invoice table td {
	padding: 10px;
	border-bottom: 1px solid #ddd;
	font-size: 14px;
}
.invoice table th {
	background: #800000;
	color: #fff;
}
.invoice table .no {
	background: #800000;
	color: #fff;
	text-align: center;
}
.invoice table .total {
	color: #800000;
	font-weight: bold;
}
.thanks {
	font-size: 1.5em;
	color: #800000;
	margin-top: 30px;
	font-weight: 600;
	text-align: center;
}
footer {
	text-align: center;
	margin-top: 20px;
	padding-top: 10px;
	border-top: 1px solid #ddd;
	color: #555;
	font-size: 13px;
}

/* ✅ Mobile Responsive */
@media (max-width: 600px) {
	.invoice {
		padding: 10px;
	}
	.header-flex {
		flex-direction: column;
		align-items: flex-start;
	}
	.company-details, .invoice-details {
		text-align: left;
	}
	.invoice table th, .invoice table td {
		font-size: 12px;
		padding: 8px;
	}
	h1.invoice-id {
		font-size: 18px;
	}
	.thanks {
		font-size: 1.2em;
	}
}
`;
