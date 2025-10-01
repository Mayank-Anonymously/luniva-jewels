const mongoose = require('mongoose');

require('dotenv').config({
	path: './applicationProperties.env',
});

const uri = process.env.DATABASE;
mongoose.set('strictQuery', false);
mongoose
	.connect(
		'mongodb+srv://nexsolvesolutions:34598345790237598714327534@cluster0.ecnexqv.mongodb.net/ecom-jewel?retryWrites=true&w=majority&appName=Cluster0%22'
	)
	.then(() => {
		console.log('DB Is connected');
	})
	.catch((err) => {
		console.log(err);
	});
