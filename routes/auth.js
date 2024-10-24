const express = require('express')
//bcrypt is a library used for hashing passwords and performing related cryptographic operations. It provides a way to hash passwords securely and to verify them later
const bcrypt = require('bcrypt')
//importing specific functions from the express-validator library. This library is used for validating and sanitizing user input in an Express.js application. Here's what each part does:
//body: This is a middleware function provided by express-validator that is used to validate and sanitize fields in the request body. You can use it to specify validation rules for different fields in your form data.
//validationResult: This function is used to collect the results of the validation and check if there are any errors. It can be used to handle and respond to invalid inputs.
const { body, validationResult } = require('express-validator')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const authenticateToken = require('../middleware/authenticateToken')
const router = express.Router()
require('dotenv').config()

// Konfiguracja multer dla przesyłania plików
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/img/uploads'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname)
	},
})
const upload = multer({ storage: storage })

// Konfiguracja nodemailer
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		//information to log into email from where the email will be sent
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

// Endpoint for user registration
router.post(
	'/register',
	[
		// Validation rules
		body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
		body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
		body('email').isEmail().withMessage('Please provide a valid email address'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters long')
			.matches(/[A-Z]/)
			.withMessage('Password must contain at least one uppercase letter')
			.matches(/\d/)
			.withMessage('Password must contain at least one digit'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() }) // Return validation errors
		}

		const { firstName, lastName, email, password } = req.body

		try {
			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				return res.status(400).json({ errors: [{ msg: 'A user with this email already exists' }] }) // Check for existing user
			}

			const hashedPassword = await bcrypt.hash(password, 10) // Hash the password
			const newUser = await User.create({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				profilePicture: null,
				role: 'normal-user',
				isVerified: false,
			})

			const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' }) // Create a verification token

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Registration Confirmation',
				text: `Thank you for registering! Click the link below to confirm your account: http://localhost:3000/api/confirm-email?token=${token}`,
				html: `<p>Thank you for registering! Click the link below to confirm your account:</p><a href="http://localhost:3000/api/confirm-email?token=${token}">Confirm account</a>`,
			}

			// Send confirmation email
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.error('Error sending confirmation email:', error)
				}
				console.log('Email sent: ' + info.response)
			})

			res.status(201).json({ msg: 'User registered. Check your email.' })
		} catch (error) {
			console.error('Error during registration:', error)
			res.status(500).json({ errors: [{ msg: 'Server error' }] })
		}
	}
)

// Endpoint for email confirmation
router.get('/confirm-email', async (req, res) => {
	const { token } = req.query

	if (!token) {
		return res.status(400).json({ errors: [{ msg: 'No verification token provided' }] })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET) // Verify the token
		const user = await User.findByPk(decoded.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid token' }] })
		}

		user.isVerified = true // Mark user as verified
		await user.save()

		const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }) // Create an authentication token

		res.redirect(`/?token=${authToken}`) // Redirect to the homepage with the token
	} catch (error) {
		console.error('Error verifying email:', error)
		res.status(400).json({ errors: [{ msg: 'Verification error' }] })
	}
})

// Endpoint for user login
router.post('/login', async (req, res) => {
	const { email, password } = req.body

	try {
		const user = await User.findOne({ where: { email } })

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] })
		}

		const isMatch = await bcrypt.compare(password, user.password) // Compare the provided password with the stored hash

		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] })
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }) // Create an authentication token

		res.json({ token }) // Return the token
	} catch (error) {
		console.error('Error during login:', error)
		res.status(500).json({ errors: [{ msg: 'Server error' }] })
	}
})

// Endpoint for fetching user profile
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId, {
			attributes: ['firstName', 'lastName', 'username', 'email', 'profilePicture', 'role'],
		})
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'User not found' }] })
		}
		res.json(user) // Return the user profile
	} catch (error) {
		console.error('Error fetching profile:', error)
		res.status(500).json({ errors: [{ msg: 'Server error' }] })
	}
})

// Endpoint for updating user profile
router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId)
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'User not found' }] })
		}

		const { firstName, lastName, username, email } = req.body
		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (username) user.username = username

		// Handle email change
		if (email && email !== user.email) {
			const emailToken = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' })
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Email Change Confirmation',
				text: `Click the link below to confirm your email address change: http://localhost:3000/api/verify-email-change?token=${emailToken}`,
				html: `<p>Click the link below to confirm your email address change:</p><a href="http://localhost:3000/api/verify-email-change?token=${emailToken}">Confirm email change</a>`,
			}

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.error('Error sending verification email:', error)
				}
				console.log('Email sent: ' + info.response)
			})

			return res.json({
				msg: 'Verification link sent to new email. Change will be confirmed after verification.',
			})
		}

		await user.save() // Save the updated user profile
		res.json(user)
	} catch (error) {
		console.error('Error updating profile:', error)
		res.status(500).json({ errors: [{ msg: 'Server error' }] })
	}
})

// Endpoint for verifying email change
router.get('/verify-email-change', async (req, res) => {
	const { token } = req.query

	if (!token) {
		return res.status(400).json({ errors: [{ msg: 'No verification token provided' }] })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findByPk(decoded.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid token' }] })
		}

		user.email = decoded.email // Update the user's email
		await user.save()

		res.redirect('/?emailVerified=true') // Redirect to the homepage
	} catch (error) {
		console.error('Error verifying email change:', error)
		res.status(400).json({ errors: [{ msg: 'Verification error' }] })
	}
})

// Endpoint for uploading profile picture
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId)
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'User not found' }] })
		}

		user.profilePicture = req.file.filename // Save the filename of the uploaded picture
		await user.save()

		res.json({ msg: 'Profile picture updated successfully', profilePicture: user.profilePicture })
	} catch (error) {
		console.error('Error uploading profile picture:', error)
		res.status(500).json({ errors: [{ msg: 'Server error' }] })
	}
})

// Endpoint for changing password
router.put('/change-password', authenticateToken, async (req, res) => {
	const { currentPassword, newPassword } = req.body

	try {
		const user = await User.findByPk(req.user.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'User not found' }] })
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password)

		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Incorrect current password' }] }) // Check if the current password is correct
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10) // Hash the new password
		user.password = hashedNewPassword
		await user.save() // Save the new password

		res.json({ msg: 'Password updated successfully' }) // Return a success message
	} catch (error) {
		console.error('Error changing password:', error)
		res.status(500).json({ errors: [{ msg: 'Server error' }] }) // Return a server error message
	}
})

module.exports = { router, transporter } // Export the router and transporter
