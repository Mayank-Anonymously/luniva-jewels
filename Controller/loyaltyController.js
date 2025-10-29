const Loyalty = require('../Schemas/LoyalityModel');

// Get loyalty status
const getLoyaltyStatus = async (req, res) => {
	const { userId } = req.params;

	try {
		const loyalty = await Loyalty.findOne({ userId });

		if (!loyalty) {
			return res.json({ purchaseCount: 0, remaining: 6, eligible: false });
		}

		const remaining = Math.max(6 - loyalty.purchaseCount, 0);
		const eligible = loyalty.purchaseCount >= 6 && !loyalty.rewardClaimed;

		res.json({
			purchaseCount: loyalty.purchaseCount,
			remaining,
			eligible,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};

// Increment purchase count
const incrementPurchase = async (req, res) => {
	const { userId, orderId } = req.params; // include orderId to avoid duplicate entries

	// try {
	// Check if loyalty record exists for the user
	let loyalty = await Loyalty.findOne({ userId });

	// If not found, create a new record
	if (!loyalty) {
		loyalty = new Loyalty({
			userId,
			purchaseCount: 1,
			purchaseHistory: [orderId], // store orderId for tracking
			rewardClaimed: false,
		});
		await loyalty.save();

		return res.json({
			message: 'First purchase added successfully!',
			purchaseCount: 1,
			eligible: false,
		});
	}
	console.log('loyalty:', loyalty);

	// Increment purchase count and update purchase history
	loyalty.purchaseCount += 1;

	await loyalty.save();

	const eligible = loyalty.purchaseCount >= 6 && !loyalty.rewardClaimed;

	res.json({
		message: 'Purchase count updated!',
		purchaseCount: loyalty.purchaseCount,
		eligible,
	});
	// } catch (err) {
	// 	console.error('Error updating purchase count:', err);
	// 	res.status(500).json({ error: 'Internal server error' });
	// }
};

// Claim reward
const claimReward = async (req, res) => {
	const { userId } = req.params;

	try {
		const loyalty = await Loyalty.findOne({ userId });
		if (!loyalty) return res.status(404).json({ error: 'User not found' });

		loyalty.rewardClaimed = true;
		await loyalty.save();

		res.json({ message: 'Reward claimed successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};

const getLoyaltyUser = async (req, res) => {
	// try {
	const loyalty = await Loyalty.find({}); // Fetch all loyalty records

	if (!loyalty || loyalty.length === 0) {
		return res.status(404).json({ message: 'No loyalty users found' });
	}
	console.log('loyalty:', loyalty);

	res.status(200).json({
		message: 'Loyalty users fetched successfully',
		data: loyalty,
	});
	// } catch (err) {
	// 	console.error('Error fetching loyalty users:', err);
	// 	res.status(500).json({ error: 'Internal server error' });
	// }
};
module.exports = {
	getLoyaltyStatus,
	incrementPurchase,
	claimReward,
	getLoyaltyUser,
};
