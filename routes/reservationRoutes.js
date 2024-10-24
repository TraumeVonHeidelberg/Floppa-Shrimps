const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const Reservation = require('../models/reservation')
const Table = require('../models/table')
const User = require('../models/user')
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

/**
 * Function to send a confirmation email to the user.
 *
 * @param {Object} reservation - The reservation object containing details of the reservation.
 * @param {string} email - The email address of the user.
 */
const sendConfirmationEmail = async (reservation, email) => {
	// Destructure the required properties from the reservation object
	const { date, time, seats, additionalInfo } = reservation

	// Create the email options object
	const mailOptions = {
		// Set the sender email address
		from: process.env.EMAIL_USER,
		// Set the recipient email address
		to: email,
		// Set the subject of the email
		subject: 'Potwierdzenie rezerwacji',
		// Set the text content of the email
		text: `Twoja rezerwacja została pomyślnie złożona!\n\nSzczegóły rezerwacji:\nData: ${date}\nGodzina: ${time}\nMiejsca: ${seats}\nDodatkowe informacje: ${
			additionalInfo || 'Brak'
		}\n\nDziękujemy!`,
	}

	try {
		// Log the email address being sent to
		console.log('Wysyłanie e-maila do:', email)
		// Send the email using the transporter
		await transporter.sendMail(mailOptions)
		// Log that the email has been sent
		console.log('E-mail z potwierdzeniem został wysłany do:', email)
	} catch (error) {
		// Log any errors that occur during email sending
		console.error('Błąd podczas wysyłania e-maila:', error)
	}
}

/**
 * Sends a cancellation email to the user.
 *
 * @param {Object} reservation - The reservation object containing details of the reservation.
 * @param {string} email - The email address of the user.
 */
const sendCancellationEmail = async (reservation, email) => {
	// Destructure the required properties from the reservation object
	const { date, time, seats, additionalInfo } = reservation

	// Create the email options object
	const mailOptions = {
		// Set the sender email address
		from: process.env.EMAIL_USER,
		// Set the recipient email address
		to: email,
		// Set the subject of the email
		subject: 'Anulowanie rezerwacji',
		// Set the text content of the email
		text: `Twoja rezerwacja została anulowana.\n\nSzczegóły rezerwacji:\nData: ${date}\nGodzina: ${time}\nMiejsca: ${seats}\nDodatkowe informacje: ${
			additionalInfo || 'Brak'
		}\n\nDziękujemy!`,
	}

	try {
		// Log the email address being sent to
		console.log('Wysyłanie e-maila do:', email)
		// Send the email using the transporter
		await transporter.sendMail(mailOptions)
		// Log that the email has been sent
		console.log('E-mail o anulowaniu został wysłany do:', email)
	} catch (error) {
		// Log any errors that occur during email sending
		console.error('Błąd podczas wysyłania e-maila:', error)
	}
}

// This function checks if a table is available for a reservation at a given date and time.
// It takes three parameters:
// - tableId: The ID of the table to check availability for.
// - date: The date of the reservation in the format 'YYYY-MM-DD'.
// - time: The start time of the reservation in the format 'HH:MM'.
// - duration (optional): The duration of the reservation in hours. Defaults to 2.
//
// The function returns a Promise that resolves to a boolean value. It returns true if the table is available,
// and false otherwise.
//
// The function first creates a Date object for the start time of the reservation. It then creates another Date object
// for the end time of the reservation by adding the duration (in hours) to the start time.
//
// The function then queries the database to find any reservations that overlap with the time range specified by
// the start time and end time. It uses the Sequelize ORM's Op.between operator to check if the reservation's time
// or end time falls within the range specified. It also checks for reservations on the same date and for the
// specified table.
//
// If there are no overlapping reservations, the function returns true, indicating that the table is available.
// If there are any overlapping reservations, the function returns false, indicating that the table is not available.
const isTableAvailable = async (tableId, date, time, duration = 2) => {
	// Create a Date object for the start time of the reservation
	const startTime = new Date(`${date}T${time}`)

	// Create a Date object for the end time of the reservation by adding the duration (in hours) to the start time
	const endTime = new Date(startTime)
	endTime.setHours(startTime.getHours() + duration)

	// Query the database to find any reservations that overlap with the time range specified
	const overlappingReservations = await Reservation.findAll({
		where: {
			tableId, // Check for reservations on the specified table
			date, // Check for reservations on the specified date
			[Op.or]: [
				{
					time: {
						[Op.between]: [
							time, // Check if the reservation's time falls within the range specified
							endTime.toTimeString().split(' ')[0],
						],
					},
				},
				{
					endTime: {
						[Op.between]: [
							time, // Check if the reservation's end time falls within the range specified
							endTime.toTimeString().split(' ')[0],
						],
					},
				},
			],
		},
	})

	// If there are no overlapping reservations, the table is available
	return overlappingReservations.length === 0
}

// Endpoint for checking table availability
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

/**
 * Middleware function to authenticate and set req.user for authenticated users.
 * This function checks if the request has an authorization header and if it does,
 * it tries to verify the JWT token in that header and set req.user with the user's ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call.
 */
const optionalAuthenticateToken = (req, res, next) => {
	// Check if the request has an authorization header
	const authHeader = req.headers['authorization']
	if (!authHeader) {
		// If the header is not present, skip authentication for non-authenticated users
		return next()
	}

	// Extract the token from the authorization header
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) {
		// If the token is not present, skip authentication
		return next()
	}

	// Verify the token using the JWT_SECRET environment variable
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			// If there is an error verifying the token, skip authentication
			return next()
		}

		// If the token is valid, set req.user with the user's ID
		req.user = {
			userId: user.userId,
		}

		// Call the next middleware function
		next()
	})
}

// Endpoint for making a reservation
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
			console.log('Logged in user email:', userEmail)
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
				const formattedEndTime = endTime.toTimeString().split(' ')[0].slice(0, 5)

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

// Endpoint to cancel reservation
router.delete('/reservations/:id', authenticateToken, async (req, res) => {
	const { id } = req.params

	try {
		const reservation = await Reservation.findByPk(id)
		if (!reservation) {
			return res.status(404).json({ error: 'Rezerwacja nie znaleziona.' })
		}

		const user = await User.findByPk(reservation.userId)
		await reservation.destroy()

		if (user) {
			await sendCancellationEmail(reservation, user.email)
		} else if (reservation.email) {
			await sendCancellationEmail(reservation, reservation.email)
		}

		res.status(200).json({ message: 'Rezerwacja anulowana.' })
	} catch (error) {
		console.error('Error deleting reservation:', error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do pobierania rezerwacji użytkownika
router.get('/reservations', authenticateToken, async (req, res) => {
	const userId = req.user.userId

	try {
		const reservations = await Reservation.findAll({
			where: { userId },
			include: [
				{
					model: Table,
					as: 'table', // Poprawienie aliasu na zgodny z definicją w associations.js
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
						as: 'table', // Poprawienie aliasu na zgodny z definicją w associations.js
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

// Endpoint do sprawdzania dostępnych miejsc dla określonej daty i godziny
router.post('/available-seats', async (req, res) => {
	const { date, time } = req.body

	try {
		const tables = await Table.findAll()

		const availableSeats = []
		for (const table of tables) {
			const isAvailable = await isTableAvailable(table.id, date, time)
			if (isAvailable) {
				availableSeats.push(table.seats)
			}
		}

		res.status(200).json({ availableSeats })
	} catch (error) {
		console.error('Error checking available seats:', error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

module.exports = router
