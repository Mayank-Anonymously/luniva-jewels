import express from 'express';
import {
	placeOrder,
	getUserOrders,
	getOrderById,
	updateOrderStatus,
	getAllOrders,
	getOrderByUserId,
} from '../Controller/orderController.js';

const orouter = express.Router();

// Create order
orouter.post('/place', placeOrder);

// Get all orders for a user
orouter.get('/user/:userId', getUserOrders);

orouter.get('/get-all-orders', getAllOrders);

// Get single order
orouter.get('/:orderId', getOrderById);

// Update status (Pending → Shipped → Delivered → Cancelled)
orouter.put('/:orderId/status', updateOrderStatus);
orouter.get('/by-user/:userId', getOrderByUserId);

export default orouter;
