const express = require('express');
const prouter = express.Router();
const paymentController = require('../Controller/paymentController');

// API endpoints
prouter.post('/pay', paymentController.initiatePayment);

module.exports = prouter;
