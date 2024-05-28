const express = require('express')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const router = express.Router()
require('dotenv').config()

// Konfiguracja nodemailer
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

// Trasa rejestracji użytkownika
router.post(
	'/register',
	[
		body('username').isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
		body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Hasło musi mieć co najmniej 6 znaków')
			.matches(/[A-Z]/)
			.withMessage('Hasło musi zawierać co najmniej jedną wielką literę')
			.matches(/\d/)
			.withMessage('Hasło musi zawierać co najmniej jedną cyfrę'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log('Validation errors:', errors.array())
			return res.status(400).json({ errors: errors.array() })
		}

		const { username, email, password } = req.body
		console.log('Received registration data:', { username, email, password })

		try {
			// Logowanie przed wyszukiwaniem użytkownika
			console.log(`Checking if user with email ${email} exists`)

			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				console.log(`User already exists with email: ${email}`)
				return res.status(400).json({ errors: [{ msg: 'Użytkownik o takim e-mailu już istnieje' }] })
			}

			// Logowanie po sprawdzeniu, czy użytkownik istnieje
			console.log(`No user found with email ${email}, proceeding with registration`)

			const hashedPassword = await bcrypt.hash(password, 10)
			const newUser = await User.create({
				username,
				email,
				password: hashedPassword,
				profilePicture: null,
				role: 'normal-user',
				isVerified: false,
			})

			// Logowanie po utworzeniu nowego użytkownika
			console.log(`User ${username} created with email ${email}`)

			const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Potwierdzenie rejestracji',
				text: 'Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto.',
				html: `<p>Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto.</p><a href="http://localhost:3000/api/confirm-email?token=${token}">Potwierdź konto</a>`,
			}

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.error('Error sending confirmation email:', error)
				}
				console.log('Email sent: ' + info.response)
			})

			res.status(201).json({ msg: 'Użytkownik zarejestrowany. Sprawdź swoją skrzynkę e-mail.' })
		} catch (error) {
			console.error('Error during registration:', error)
			res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
		}
	}
)

// Trasa potwierdzenia e-maila
router.get('/confirm-email', async (req, res) => {
	const { token } = req.query
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findByPk(decoded.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy token' }] })
		}

		user.isVerified = true
		await user.save()

		res.status(200).json({ msg: 'Konto zostało potwierdzone' })
	} catch (error) {
		console.error('Error during email confirmation:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

// Trasa logowania użytkownika
router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
		body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, password } = req.body

		try {
			const user = await User.findOne({ where: { email } })
			if (!user) {
				return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy email lub hasło' }] })
			}

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy email lub hasło' }] })
			}

			if (!user.isVerified) {
				return res.status(400).json({ errors: [{ msg: 'Konto nie zostało zweryfikowane' }] })
			}

			const payload = {
				user: {
					id: user.id,
					role: user.role,
				},
			}

			jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
				if (err) throw err
				res.json({ token })
			})
		} catch (error) {
			console.error(error)
			res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
		}
	}
)

module.exports = router
