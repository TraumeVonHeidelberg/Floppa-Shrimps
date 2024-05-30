const express = require('express')
const bcrypt = require('bcrypt')
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
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

router.post(
	'/register',
	[
		body('firstName').isLength({ min: 2 }).withMessage('Imię musi mieć co najmniej 2 znaki'),
		body('lastName').isLength({ min: 2 }).withMessage('Nazwisko musi mieć co najmniej 2 znaki'),
		body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Hasło musi mieć co najmniej 6 znaków')
			.matches(/[A-Z]/)
			.withMessage('Hasło musi zawierać co najmniej jedną dużą literę')
			.matches(/\d/)
			.withMessage('Hasło musi zawierać co najmniej jedną cyfrę'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { firstName, lastName, email, password } = req.body

		try {
			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				return res.status(400).json({ errors: [{ msg: 'Użytkownik o takim e-mailu już istnieje' }] })
			}

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

			const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Potwierdzenie rejestracji',
				text: `Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto: http://localhost:3000/api/confirm-email?token=${token}`,
				html: `<p>Dziękujemy za rejestrację! Kliknij poniższy link, aby potwierdzić swoje konto:</p><a href="http://localhost:3000/api/confirm-email?token=${token}">Potwierdź konto</a>`,
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

	if (!token) {
		return res.status(400).json({ errors: [{ msg: 'Brak tokenu weryfikacyjnego' }] })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findByPk(decoded.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Nieprawidłowy token' }] })
		}

		user.isVerified = true
		await user.save()

		const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

		res.redirect(`/?token=${authToken}`)
	} catch (error) {
		console.error('Error verifying email:', error)
		res.status(400).json({ errors: [{ msg: 'Błąd podczas weryfikacji' }] })
	}
})

router.post('/login', async (req, res) => {
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

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

		res.json({ token })
	} catch (error) {
		console.error('Error during login:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId, {
			attributes: ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'profilePicture', 'role'],
		})
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'Użytkownik nie znaleziony' }] })
		}
		res.json(user)
	} catch (error) {
		console.error('Error fetching profile:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId)
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'Użytkownik nie znaleziony' }] })
		}

		// Zaktualizuj tylko dozwolone pola
		const { firstName, lastName, username, email, phoneNumber } = req.body
		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (username) user.username = username
		if (email) user.email = email
		if (phoneNumber) user.phoneNumber = phoneNumber

		await user.save()
		res.json(user)
	} catch (error) {
		console.error('Error updating profile:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId)
		if (!user) {
			return res.status(404).json({ errors: [{ msg: 'Użytkownik nie znaleziony' }] })
		}

		user.profilePicture = req.file.filename
		await user.save()

		res.json({ msg: 'Zdjęcie profilowe zaktualizowane pomyślnie', profilePicture: user.profilePicture })
	} catch (error) {
		console.error('Error uploading profile picture:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

router.put('/change-password', authenticateToken, async (req, res) => {
	const { currentPassword, newPassword } = req.body

	try {
		const user = await User.findByPk(req.user.userId)

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Użytkownik nie znaleziony' }] })
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password)

		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Stare hasło jest nieprawidłowe' }] })
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10)
		user.password = hashedNewPassword
		await user.save()

		res.json({ msg: 'Hasło zostało zaktualizowane pomyślnie' })
	} catch (error) {
		console.error('Error changing password:', error)
		res.status(500).json({ errors: [{ msg: 'Błąd serwera' }] })
	}
})

module.exports = router
