const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
	{
		userId: { type: String, required: true, unique: true },
		purchaseCount: { type: Number, default: 0 },
		rewardClaimed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Loyalty', loyaltySchema);
