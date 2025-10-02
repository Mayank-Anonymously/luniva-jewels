const express = require('express');
const prouter = express.Router();
const paymentController = require('../Controller/paymentController');

// API endpoints
prouter.post('/pay', paymentController.initiatePayment);
prouter.get('/status/:merchantOrderId', paymentController.checkPaymentStatus);

module.exports = prouter;
