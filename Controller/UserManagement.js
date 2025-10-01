const User = require('../Schemas/userSchema.js');
const nodemailer = require('nodemailer');
const Product = require('../Schemas/ProductSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({
	path: '../applicationProperties.env',
});
// JWT Secret (put in .env in real projects)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ---------------- AUTH ----------------

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465, // SSL
	secure: true, // true for port 465, false for 587
	auth: {
		user: process.env.SMTP_USER, // your Gmail
		pass: process.env.SMTP_PASS, // app password, not Gmail password
	},
});
// Generate 6-digit OTP
const generateOtp = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

// Register User
const register = async (req, res) => {
	console.log(req.body);
	try {
		const { name, email, password } = req.body;

		// Check if user exists
		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate OTP
		const otp = generateOtp();
		const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

		// Create user with OTP fields
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			otp,
			otpExpiry,
			isVerified: false,
		});

		// Send OTP email
		const mailOptions = {
			from: `"Luniva" <${process.env.SMTP_USER}>`,
			to: email,
			subject: 'Verify Your Email - OTP',
			html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for registering on <b>Luniva </b>.</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <h3 style="color: #2c3e50;">${otp}</h3>
        <p>This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
        <br/>
        <p>If you did not sign up, please ignore this email.</p>
        <p>— The Luniva Team</p>
      `,
		};

		await transporter.sendMail(mailOptions);

		res.status(201).json({
			message: 'User registered successfully. OTP sent to email.',
			user: user,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
};

const verifyOtp = async (req, res) => {
	try {
		const { userId, otp } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: 'User not found' });

		// Check OTP validity
		if (user.otp !== otp || Date.now() > user.otpExpiry) {
			return res.status(400).json({ message: 'Invalid or expired OTP' });
		}

		// Mark user as verified
		user.isVerified = true;
		user.otp = null;
		user.otpExpiry = null;
		await user.save();

		res.status(200).json({ message: 'User verified successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Login User
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(401).json({ message: 'Invalid credentials' });

		// Generate JWT
		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

		res.json({ message: 'Login successful', token, user });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const changePassword = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(401).json({ message: 'Invalid credentials' });

		// Generate JWT
		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

		res.json({ message: 'Login successful', token, user });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Logout (frontend just clears token, here optional blacklisting)
const logout = (req, res) => {
	res.json({ message: 'Logout successful' });
};

// ---------------- CART ----------------

// Add product to cart
const addToCart = async (req, res) => {
	try {
		const { userId, productId, quantity } = req.body;

		const user = await User.findById(userId);
		const product = await Product.findById(productId);

		if (!product) return res.status(404).json({ message: 'Product not found' });

		// Check if product already in cart
		const existing = user.cart.find(
			(item) => item.product.toString() === productId
		);

		if (existing) {
			existing.quantity += quantity;
		} else {
			user.cart.push({ product: productId, quantity });
		}

		await user.save();
		res.json({ message: 'Product added to cart', cart: user.cart });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Remove item from cart
const removeFromCart = async (req, res) => {
	try {
		const { userId, productId } = req.body;

		const user = await User.findById(userId);
		user.cart = user.cart.filter(
			(item) => item.product.toString() !== productId
		);

		await user.save();
		res.json({ message: 'Item removed', cart: user.cart });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Clear cart
const clearCart = async (req, res) => {
	try {
		const { userId } = req.body;
		const user = await User.findById(userId);

		user.cart = [];
		await user.save();

		res.json({ message: 'Cart cleared', cart: [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// ---------------- ORDERS ----------------
module.exports = {
	removeFromCart,
	clearCart,
	addToCart,
	logout,
	login,
	verifyOtp,
	register,
};
