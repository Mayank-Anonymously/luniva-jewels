const express = require('express');
const lrouter = express.Router();
const {
	getLoyaltyStatus,
	incrementPurchase,
	claimReward,
} = require('../Controller/loyaltyController');

lrouter.get('/:userId', getLoyaltyStatus);
lrouter.post('/:userId/increment', incrementPurchase);
lrouter.post('/:userId/claim', claimReward);

module.exports = lrouter;
