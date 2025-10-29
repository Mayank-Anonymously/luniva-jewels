const express = require('express');
const lrouter = express.Router();
const {
	getLoyaltyStatus,
	incrementPurchase,
	claimReward,
	getLoyaltyUser,
} = require('../Controller/loyaltyController');

lrouter.get('/:userId', getLoyaltyStatus);
lrouter.post('/:userId/increment', incrementPurchase);
lrouter.post('/:userId/claim', claimReward);
lrouter.get('/get-all-loyalty-user', getLoyaltyUser);

module.exports = lrouter;
