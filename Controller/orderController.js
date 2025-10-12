import Order from '../Schemas/OrderSchema.js';
import User from '../Schemas/userSchema.js';

// Place a new order
export const placeOrder = async (req, res) => {
	// try {
	const { userId, shippingAddress, billingAddress, paymentMethod, items } =
		req.body;
	console.log(userId);
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
	const order = new Order({
		user: userId,
		items,
		total,
		shippingAddress,
		billingAddress,
		paymentMethod,
	});

	await order.save();

	await user.save();

	res.status(201).json({
		message: 'Order placed successfully',
		order,
	});
	// } catch (err) {
	// 	res.status(500).json({ error: err.message });
	// }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
	try {
		const { userId } = req.params;
		const orders = await Order.find({ user: userId }).populate('items.product');
		res.json({ orders });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get single order by ID
export const getOrderById = async (req, res) => {
	// try {
	const { orderId } = req.params;
	const order = await Order.findOne({ orderId: orderId });

	if (!order) return res.status(404).json({ message: 'Order not found' });
	res.json(order);
	// } catch (err) {
	// 	res.status(500).json({ error: err.message });
	// }
};
export const getAllOrders = async (req, res) => {
	try {
		const order = await Order.find({});

		if (!order) return res.status(404).json({ message: 'Order not found' });
		res.json(order);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update order status (Admin only usually)
export const updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status } = req.body;

		const order = await Order.findById(orderId);
		if (!order) return res.status(404).json({ message: 'Order not found' });

		order.status = status;
		await order.save();

		res.json({ message: 'Order status updated', order });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get all orders by user ID
export const getOrderByUserId = async (req, res) => {
	try {
		const { userId } = req.params;

		const orders = await Order.find({ user: userId });

		if (!orders || orders.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No orders found for this user.',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Orders fetched successfully',
			orders,
		});
	} catch (err) {
		console.error('❌ Error fetching orders:', err.message);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: err.message,
		});
	}
};
