import express from 'express';
import {
	placeOrder,
	getUserOrders,
	getOrderById,
	updateOrderStatus,
} from '../Controller/orderController.js';

const orouter = express.Router();

// Create order
orouter.post('/place', placeOrder);

// Get all orders for a user
orouter.get('/user/:userId', getUserOrders);

// Get single order
orouter.get('/:orderId', getOrderById);

// Update status (Pending → Shipped → Delivered → Cancelled)
orouter.put('/:orderId/status', updateOrderStatus);

export default orouter;
