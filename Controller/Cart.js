const CartSchema = require('../Schemas/Cart');
const User = require('../Schemas/userSchema');

// ------------------ Add to Cart ------------------
const AddToCart = async (req, res) => {
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
			return res.status(200).json({
				baseResponse: {
					message: 'ProductId and UserId are required',
					status: 0,
				},
				response: [],
			});
		}

		// Check if item already exists in user's cart
		const existingItem = await CartSchema.findOne({ _id });

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

		// Create new cart item
		const newItem = new CartSchema({
			userId,
			id: _id,
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
			{ $set: { cart: newItem } },
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

// ------------------ Get All Cart Items for a User ------------------
const GetAllItems = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({
				baseResponse: { message: 'UserId is required', status: 0 },
				response: [],
			});
		}

		const cartItems = await CartSchema.find({ userId: userId });

		if (!cartItems || cartItems.length === 0) {
			return res.status(200).json({
				baseResponse: { message: 'Cart is empty', status: 1 },
				response: [],
			});
		}

		res.status(200).json({
			baseResponse: { message: 'Cart Items Fetched Successfully', status: 1 },
			response: cartItems,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Fetching Cart Items', status: 0 },
			response: [],
		});
	}
};

// ------------------ Remove Item from Cart ------------------
const RemoveFromCart = async (req, res) => {
	try {
		const { id, userId } = req.params;
		console.log(req.params);
		if (!id || !userId) {
			return res.status(400).json({
				baseResponse: {
					message: 'ProductId and UserId are required',
					status: 0,
				},
				response: [],
			});
		}

		const deleted = await CartSchema.findOneAndDelete({ id });

		if (!deleted) {
			return res.status(404).json({
				baseResponse: { message: 'Item not found in cart', status: 0 },
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

// ------------------ Clear Cart ------------------
const ClearCart = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({
				baseResponse: { message: 'UserId is required', status: 0 },
				response: [],
			});
		}

		await CartSchema.deleteMany({ userId });

		res.status(200).json({
			baseResponse: { message: 'Cart Cleared Successfully', status: 1 },
			response: [],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			baseResponse: { message: 'Error Clearing Cart', status: 0 },
			response: [],
		});
	}
};

module.exports = {
	AddToCart,
	GetAllItems,
	RemoveFromCart,
	ClearCart,
};
