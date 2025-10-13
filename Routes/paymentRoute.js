const express = require('express');
const prouter = express.Router();
const paymentController = require('../Controller/paymentController');

// API endpoints
prouter.post('/pay', paymentController.initiatePayment);
prouter.get('/status/:merchantOrderId', paymentController.checkPaymentStatus);
prouter.post('/send-invoice', paymentController.sendInvoiceMail);

module.exports = prouter;
