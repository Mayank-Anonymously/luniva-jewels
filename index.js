const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const ProductRouter = require('./Routes/ProductRoute');
require('dotenv').config({
	path: './applicationProperties.env',
});
require('./Config/DBconnection');
const PORT = process.env.PORT || 9000;
const path = require('path');
const CateRouter = require('./Routes/Category');
const CartRoutes = require('./Routes/Cart');
const { default: orouter } = require('./Routes/orderRouter');
const { default: authrouter } = require('./Routes/authRouter');
const prouter = require('./Routes/paymentRoute');
const WishlistRouter = require('./Routes/WishlistSchema');
const Product = require('./Schemas/ProductSchema');
const SavedAddress = require('./Schemas/SavedAddress');
const savedrouter = require('./Routes/SavedAddress');
const lrouter = require('./Routes/loyaltyRouter');

const corsOpts = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'PATCH'],

	allowedHeaders: ['Content-Type', '* ', 'Authorization', 'X-Requested-With'],
};

// parse application/json

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOpts));

/* API ENPOINTS */
app.use('/product', ProductRouter);
app.use('/', CateRouter);
app.use('/cart', CartRoutes);
app.use('/order', orouter);
app.use('/auth', authrouter);
app.use('/address', savedrouter);
app.use('/payment', prouter);
app.use('/wishlist', WishlistRouter);
app.use('/loyality', lrouter);

app.post('/get-check', async (req, res) => {
	try {
		const { jsonArray } = req.body; // assuming you send the list in body

		const results = await Promise.all(
			jsonArray.map(async (item) => {
				return await Product.findOneAndUpdate(
					{ image: item },
					{ $set: { style: 'party-collection' } }
				);
			})
		);

		res.json({ message: 'Products updated successfully', results });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});

// server.js

// GET route to fetch city and state by pincode
app.get('/api/pincode/:code', async (req, res) => {
	const { code } = req.params;

	try {
		// Make API call to India Postal service
		const response = await axios.get(
			`https://api.postalpincode.in/pincode/${code}`
		);

		if (
			response.data &&
			response.data[0] &&
			response.data[0].PostOffice &&
			response.data[0].PostOffice.length > 0
		) {
			const detailsFound = response.data[0].PostOffice[0];

			// Return required fields
			res.json({
				success: true,
				message: 'Pincode details found',
				data: {
					city: detailsFound.District || '',
					state: detailsFound.State || '',
					country: detailsFound.Country || '',
					pincode: code,
					postOfficeName: detailsFound.Name || '',
				},
			});
		} else {
			res.status(404).json({
				success: false,
				message: 'Invalid pincode or no details found',
			});
		}
	} catch (error) {
		console.error('❌ Error fetching pincode details:', error.message);
		res.status(500).json({
			success: false,
			message: 'Internal Server Error',
			error: error.message,
		});
	}
});

/* API ENPOINTS */

/* --------------------------------------------------------------------------------------------------- */

/* IMAGE ENPOINT */
app.use('/resources', express.static(path.join(__dirname, 'images')));
/* IMAGE ENPOINT */

app.listen(PORT, () => {
	console.log(`the port is ready to listen on port ${PORT}`);
});
