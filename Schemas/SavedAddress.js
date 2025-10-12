const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		street: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String },
		zip: { type: String },
		country: { type: String, default: 'INDIA' }, // default if desired
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
