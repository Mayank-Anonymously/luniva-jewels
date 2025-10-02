const express = require('express');
const app = express();
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
app.use('/payment', prouter);

/* API ENPOINTS */

/* --------------------------------------------------------------------------------------------------- */

/* IMAGE ENPOINT */
app.use('/resources', express.static(path.join(__dirname, 'images')));
/* IMAGE ENPOINT */

app.listen(PORT, () => {
	console.log(`the port is ready to listen on port ${PORT}`);
});
