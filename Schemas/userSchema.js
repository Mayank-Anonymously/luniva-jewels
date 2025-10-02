const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			minlength: 6,
		},
		isVerified: { type: Boolean, default: false },
		otp: String,
		otpExpiry: Date,
		role: {
			type: String,

			default: 'user',
		},
		cart: [],
		addresses: [
			{
				type: {
					type: String,
					enum: ['shipping', 'billing'],
				},
				fullName: String,
				phone: String,
				street: String,
				city: String,
				state: String,
				postalCode: String,
				country: String,
			},
		],
	},
	{ timestamps: true }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Password check method
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
