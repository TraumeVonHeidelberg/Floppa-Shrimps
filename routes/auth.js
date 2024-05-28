const express = require('express')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const Sequelize = require('sequelize')
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
			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				console.log('User already exists with email:', email)
				return res.status(400).json({ errors: [{ msg: 'Użytkownik o takim e-mailu już istnieje' }] })
			}

			const hashedPassword = await bcrypt.hash(password, 10)
			const newUser = await User.create({
				username,
				email,
				password: hashedPassword,
				profilePicture: null,
				role: 'normal-user',
			})

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Potwierdzenie rejestracji',
				text: 'Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto.',
				html: '<p>Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto.</p><a href="http://localhost:3000/confirm-email">Potwierdź konto</a>',
			}

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error(error)
				} else {
					console.log('Email sent: ' + info.response)
				}
			})

			res.status(201).json({ msg: 'Użytkownik zarejestrowany. Sprawdź swoją skrzynkę e-mail.' })
		} catch (error) {
			console.error('Error during registration:', error)
			res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
		}
	}
)

module.exports = router
