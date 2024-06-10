const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const Reservation = require('../models/reservation')
const Table = require('../models/table')
const User = require('../models/user') // Import modelu użytkownika
const authenticateToken = require('../middleware/authenticateToken')
const { Op } = require('sequelize')
require('dotenv').config()

// Konfiguracja nodemailer
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

// Funkcja wysyłająca e-mail potwierdzający
const sendConfirmationEmail = async (reservation, email) => {
	const { date, time, seats, additionalInfo } = reservation

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Potwierdzenie rezerwacji',
		text: `Twoja rezerwacja została pomyślnie złożona!\n\nSzczegóły rezerwacji:\nData: ${date}\nGodzina: ${time}\nMiejsca: ${seats}\nDodatkowe informacje: ${
			additionalInfo || 'Brak'
		}\n\nDziękujemy!`,
	}

	try {
		console.log('Wysyłanie e-maila do:', email) // Dodaj logowanie adresu e-mail
		await transporter.sendMail(mailOptions)
		console.log('E-mail z potwierdzeniem został wysłany do:', email)
	} catch (error) {
		console.error('Błąd podczas wysyłania e-maila:', error)
	}
}

const sendCancellationEmail = async (reservation, email) => {
	const { date, time, seats, additionalInfo } = reservation

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Anulowanie rezerwacji',
		text: `Twoja rezerwacja została anulowana.\n\nSzczegóły rezerwacji:\nData: ${date}\nGodzina: ${time}\nMiejsca: ${seats}\nDodatkowe informacje: ${
			additionalInfo || 'Brak'
		}\n\nDziękujemy!`,
	}

	try {
		console.log('Wysyłanie e-maila do:', email)
		await transporter.sendMail(mailOptions)
		console.log('E-mail o anulowaniu został wysłany do:', email)
	} catch (error) {
		console.error('Błąd podczas wysyłania e-maila:', error)
	}
}

// Funkcja sprawdzająca dostępność stolika
const isTableAvailable = async (tableId, date, time, duration = 2) => {
	const startTime = new Date(`${date}T${time}`)
	const endTime = new Date(startTime)
	endTime.setHours(startTime.getHours() + duration)

	const overlappingReservations = await Reservation.findAll({
		where: {
			tableId,
			date,
			[Op.or]: [
				{ time: { [Op.between]: [time, endTime.toTimeString().split(' ')[0]] } },
				{ endTime: { [Op.between]: [time, endTime.toTimeString().split(' ')[0]] } },
			],
		},
	})

	return overlappingReservations.length === 0
}

// Endpoint do sprawdzania dostępności rezerwacji
router.post('/check-availability', async (req, res) => {
	const { date, time, seats } = req.body

	try {
		const tables = await Table.findAll({
			where: {
				seats: { [Op.gte]: seats },
			},
		})

		for (const table of tables) {
			const available = await isTableAvailable(table.id, date, time)
			if (available) {
				return res.status(200).json({ available: true, tableId: table.id })
			}
		}

		res.status(200).json({ available: false })
	} catch (error) {
		console.error('Error checking availability:', error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Middleware to authenticate and set req.user for authenticated users
const optionalAuthenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization']
	if (!authHeader) {
		return next() // Skip authentication for non-authenticated users
	}

	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) return next()

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return next()
		req.user = {
			userId: user.userId,
		}
		next()
	})
}

// Endpoint do tworzenia rezerwacji
router.post('/reservations', optionalAuthenticateToken, async (req, res) => {
	const { date, time, seats, additionalInfo, firstName, lastName, email } = req.body
	let userId = null
	let userEmail = email

	if (req.user) {
		userId = req.user.userId
		console.log('Logged in user ID:', userId)

		// Pobierz e-mail z profilu użytkownika
		const user = await User.findByPk(userId)
		if (user) {
			userEmail = user.email
			console.log('Logged in user email:', userEmail) // Dodaj logowanie e-maila
		}
	} else {
		console.log('No user logged in')
	}

	console.log('Reservation data:', { date, time, seats, additionalInfo, userId, firstName, lastName, userEmail })

	if (!userEmail) {
		console.error('Brak adresu e-mail do wysłania potwierdzenia.')
		return res.status(400).json({ error: 'Brak adresu e-mail do wysłania potwierdzenia.' })
	}

	try {
		const tables = await Table.findAll({
			where: {
				seats: { [Op.gte]: seats },
			},
		})

		for (const table of tables) {
			const available = await isTableAvailable(table.id, date, time)
			if (available) {
				const startTime = new Date(`${date}T${time}`)
				const endTime = new Date(startTime)
				endTime.setHours(startTime.getHours() + 2)
				const formattedEndTime = endTime.toTimeString().split(' ')[0].slice(0, 5) // Zmiana tutaj

				const reservation = await Reservation.create({
					date,
					time,
					seats,
					additionalInfo,
					userId,
					firstName,
					lastName,
					email: userEmail,
					tableId: table.id,
					endTime: formattedEndTime,
				})

				// Wysyłanie e-maila potwierdzającego
				await sendConfirmationEmail(reservation, userEmail)

				return res.status(201).json(reservation)
			}
		}

		res.status(400).json({ error: 'Brak dostępnych stolików w wybranym terminie.' })
	} catch (error) {
		console.error('Error creating reservation:', error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do anulowania rezerwacji
router.delete('/reservations/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ error: 'Rezerwacja nie znaleziona.' });
        }

        const user = await User.findByPk(reservation.userId);
        await reservation.destroy();

        if (user) {
            await sendCancellationEmail(reservation, user.email);
        } else if (reservation.email) {
            await sendCancellationEmail(reservation, reservation.email);
        }

        res.status(200).json({ message: 'Rezerwacja anulowana.' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint do pobierania rezerwacji użytkownika
router.get('/reservations', authenticateToken, async (req, res) => {
	const userId = req.user.userId

	try {
		const reservations = await Reservation.findAll({
			where: { userId },
			include: [
				{
					model: Table,
					as: 'reservationTable',
				},
			],
		})

		res.status(200).json(reservations)
	} catch (error) {
		console.error('Error fetching reservations:', error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do pobierania wszystkich rezerwacji
router.get('/admin/reservations', authenticateToken, async (req, res) => {
	const user = await User.findByPk(req.user.userId)
	if (user && user.role === 'admin') {
		try {
			const reservations = await Reservation.findAll({
				include: [
					{
						model: Table,
						as: 'reservationTable',
					},
					{
						model: User,
						as: 'user',
						attributes: ['firstName', 'lastName', 'email'],
					},
				],
			})

			res.status(200).json(reservations)
		} catch (error) {
			console.error('Error fetching reservations:', error)
			res.status(500).json({ error: 'Błąd serwera' })
		}
	} else {
		res.status(403).json({ error: 'Brak dostępu' })
	}
})

module.exports = router
