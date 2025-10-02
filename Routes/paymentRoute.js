const express = require('express');
const prouter = express.Router();
const paymentController = require('../Controller/paymentController');

// API endpoints
prouter.post('/pay', paymentController.initiatePayment);
prouter.post('/status/:ordeId', paymentController.checkPaymentStatus);

module.exports = prouter;
