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

// Rejestracja użytkownika
router.post(
	'/register',
	[
		body('firstName').isLength({ min: 1 }).withMessage('Imię jest wymagane'),
		body('lastName').isLength({ min: 1 }).withMessage('Nazwisko jest wymagane'),
		body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Hasło musi mieć co najmniej 6 znaków')
			.matches(/\d/)
			.withMessage('Hasło musi zawierać co najmniej jedną cyfrę')
			.matches(/[A-Z]/)
			.withMessage('Hasło musi zawierać co najmniej jedną wielką literę'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log('Validation errors:', errors.array())
			return res.status(400).json({ errors: errors.array() })
		}

		const { firstName, lastName, email, password } = req.body
		console.log('Received registration data:', { firstName, lastName, email, password })

		try {
			console.log(`Checking if user with email ${email} exists`)

			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				console.log(`User already exists with email: ${email}`)
				return res.status(400).json({ errors: [{ msg: 'Użytkownik o takim e-mailu już istnieje' }] })
			}

			console.log(`No user found with email ${email}, proceeding with registration`)

			const hashedPassword = await bcrypt.hash(password, 10)
			const newUser = await User.create({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				profilePicture: null,
				role: 'normal-user',
				isVerified: false,
			})

			console.log(`User ${firstName} ${lastName} created with email ${email}`)

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

// Logowanie użytkownika
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
				return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy adres e-mail lub hasło' }] })
			}

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy adres e-mail lub hasło' }] })
			}

			if (!user.isVerified) {
				return res.status(400).json({ errors: [{ msg: 'Musisz potwierdzić swoje konto przed zalogowaniem' }] })
			}

			const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

			res.json({ token })
		} catch (error) {
			console.error('Error during login:', error)
			res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
		}
	}
)

// Potwierdzenie rejestracji
router.get('/confirm-email', async (req, res) => {
	const { token } = req.query

	if (!token) {
		return res.status(400).json({ msg: 'Brak tokena' })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const userId = decoded.userId

		const user = await User.findByPk(userId)
		if (!user) {
			return res.status(400).json({ msg: 'Nieprawidłowy token' })
		}

		user.isVerified = true
		await user.save()

		res.status(200).send('Twoje konto zostało potwierdzone!')
	} catch (error) {
		console.error('Error during email confirmation:', error)
		res.status(500).json({ msg: 'Błąd serwera' })
	}
})

module.exports = router
