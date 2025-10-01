import express from 'express';
import {
	register,
	login,
	logout,
	verifyOtp,
} from '../Controller/UserManagement.js';

const authrouter = express.Router();

// Auth
authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.post('/logout', logout);
authrouter.post('/verify-otp', verifyOtp);

export default authrouter;
