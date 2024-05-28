const express = require('express')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const Sequelize = require('sequelize')
const User = require('../models/user')
const VerificationToken = require('../models/verificationToken')
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

router.post(
	'/register',
	[
		body('username').isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
		body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
		body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
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

			// Generowanie tokenu weryfikacyjnego
			const token = crypto.randomBytes(32).toString('hex')
			await VerificationToken.create({
				userId: newUser.id,
				token: token,
			})

			const verificationLink = `http://localhost:3000/api/confirm-email?token=${token}`

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Potwierdzenie rejestracji',
				text: `Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto: ${verificationLink}`,
				html: `<p>Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto:</p><a href="${verificationLink}">Potwierdź konto</a>`,
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

router.get('/confirm-email', async (req, res) => {
	const { token } = req.query

	try {
		const verificationToken = await VerificationToken.findOne({ where: { token } })

		if (!verificationToken) {
			return res.status(400).json({ msg: 'Nieprawidłowy token weryfikacyjny' })
		}

		const user = await User.findOne({ where: { id: verificationToken.userId } })

		if (!user) {
			return res.status(400).json({ msg: 'Użytkownik nie istnieje' })
		}

		user.isVerified = true
		await user.save()

		// Usuń token po weryfikacji
		await VerificationToken.destroy({ where: { id: verificationToken.id } })

		res.status(200).json({ msg: 'Konto zostało zweryfikowane. Możesz się teraz zalogować.' })
	} catch (error) {
		console.error('Error confirming email:', error)
		res.status(500).json({ msg: 'Błąd serwera' })
	}
})

module.exports = router
