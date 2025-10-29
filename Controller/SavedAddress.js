const SavedAddress = require('../Schemas/SavedAddress');

// Save a new address for a user
exports.saveAddress = async (req, res) => {
	try {
		const { userId, street, city, state, zip, country } = req.body;

		if (!userId || !street || !city) {
			return res
				.status(400)
				.json({ message: 'userId, street, and city are required.' });
		}

		const newAddress = new SavedAddress({
			userId,
			street,
			city,
			state,
			zip,
			country,
		});

		const savedAddress = await newAddress.save();

		return res.status(201).json({
			message: 'Address saved successfully',
			address: savedAddress,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: 'Server error', error: error.message });
	}
};

exports.getAddressesByUserId = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res
				.status(400)
				.json({ success: false, message: 'User ID is required' });
		}

		const addresses = await SavedAddress.find({ userId });

		res.status(200).json({
			success: true,
			count: addresses.length,
			addresses,
		});
	} catch (error) {
		console.error('Error fetching addresses:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
