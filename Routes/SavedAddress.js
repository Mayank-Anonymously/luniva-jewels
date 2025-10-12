const express = require('express');
const {
	saveAddress,
	getAddressesByUserId,
} = require('../Controller/SavedAddress');
const savedrouter = express.Router();

// POST /addresses -> save a new address
savedrouter.post('/save', saveAddress);
savedrouter.get('/list/:userId', getAddressesByUserId);

module.exports = savedrouter;
