const User = require('../Schemas/userSchema');
const Wishlist = require('../Schemas/WishlistSchema');

// ------------------ Add to Wishlist ------------------
const AddToWishlist = async (req, res) => {
	try {
		const {
			_id,
			quantity = 1,
			title,
			description,
			price,
			priceSale,
			image,
			categoryId,
			categoryName,
			productSku,
			productCode,
			inStock,
			userId,
		} = req.body;

		if (!_id || !userId) {
			return res.status(400).json({
				baseResponse: {
					message: 'ProductId and UserId are required',
					status: 0,
				},
				response: [],
			});
		}

		// Check if item already exists in user's Wishlist
		const existingItem = await Wishlist.findOne({ _id });

		if (existingItem) {
			// Update quantity if already exists[]
			existingItem.quantity =
				parseInt(existingItem.quantity) + parseInt(quantity);
			await existingItem.save();
			return res.status(200).json({
				baseResponse: { message: 'Quantity Updated Successfully', status: 1 },
				response: existingItem,
			});
		}

		// Create new Wishlist item
		const newItem = new Wishlist({
			id: userId,
			_id: _id,
			title,
			description,
			price,
			priceSale,
			image,
			categoryId,
			categoryName,
			productSku,
			productCode,
			inStock,
			quantity,
		});

		await User.findOneAndUpdate(
			{ _id: userId },
			{ $set: { Wishlist: newItem } },
			{ new: true, upsert: true }
		);
		await newItem.save();
		res.status(200).json({
			baseResponse: { message: 'Item Added Successfully', status: 1 },
			response: newItem,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Adding Item', status: 0 },
			response: [],
		});
	}
};

// ------------------ Get All Wishlist Items for a User ------------------
const GetAllItems = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({
				baseResponse: { message: 'UserId is required', status: 0 },
				response: [],
			});
		}

		const WishlistItems = await Wishlist.find({ id: userId });

		if (!WishlistItems || WishlistItems.length === 0) {
			return res.status(200).json({
				baseResponse: { message: 'Wishlist is empty', status: 1 },
				response: [],
			});
		}

		res.status(200).json({
			baseResponse: {
				message: 'Wishlist Items Fetched Successfully',
				status: 1,
			},
			response: WishlistItems,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Fetching Wishlist Items', status: 0 },
			response: [],
		});
	}
};

const GetAllItemsById = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log(userId);
		if (!userId) {
			return res.status(400).json({
				baseResponse: { message: 'UserId is required', status: 0 },
				response: [],
			});
		}

		const WishlistItems = await Wishlist.find({ id: userId });

		if (!WishlistItems || WishlistItems.length === 0) {
			return res.status(200).json({
				baseResponse: { message: 'Wishlist is empty', status: 1 },
				response: [],
			});
		}

		res.status(200).json({
			baseResponse: {
				message: 'Wishlist Items Fetched Successfully',
				status: 1,
			},
			response: WishlistItems,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Fetching Wishlist Items', status: 0 },
			response: [],
		});
	}
};

// ------------------ Remove Item from Wishlist ------------------
const RemoveFromWishlist = async (req, res) => {
	try {
		const { id, userId } = req.params;
		if (!id || !userId) {
			return res.status(400).json({
				baseResponse: {
					message: 'ProductId and UserId are required',
					status: 0,
				},
				response: [],
			});
		}

		const deleted = await Wishlist.findOneAndDelete({ _id: id });

		if (!deleted) {
			return res.status(404).json({
				baseResponse: { message: 'Item not found in Wishlist', status: 0 },
				response: [],
			});
		}

		res.status(200).json({
			baseResponse: { message: 'Item Removed Successfully', status: 1 },
			response: deleted,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Removing Item', status: 0 },
			response: [],
		});
	}
};

// ------------------ Clear Wishlist ------------------
const ClearWishlist = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({
				baseResponse: { message: 'UserId is required', status: 0 },
				response: [],
			});
		}

		await Wishlist.deleteMany({ userId });

		res.status(200).json({
			baseResponse: { message: 'Wishlist Cleared Successfully', status: 1 },
			response: [],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Clearing Wishlist', status: 0 },
			response: [],
		});
	}
};

module.exports = {
	AddToWishlist,
	GetAllItems,
	RemoveFromWishlist,
	ClearWishlist,
	GetAllItemsById,
};
