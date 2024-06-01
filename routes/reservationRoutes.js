const express = require('express')
const router = express.Router()
const Reservation = require('../models/reservation')
const authenticateToken = require('../middleware/authenticateToken')
const { Op } = require('sequelize')

// Endpoint do sprawdzania dostępności rezerwacji
router.post('/check-availability', async (req, res) => {
	const { date, time, seats } = req.body

	try {
		const existingReservations = await Reservation.findAll({
			where: {
				date,
				time,
				seats: {
					[Op.gte]: seats,
				},
			},
		})

		if (existingReservations.length > 0) {
			return res.status(400).json({ error: 'Termin niedostępny. Wybierz inny czas.' })
		}

		res.json({ available: true })
	} catch (err) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do dodawania nowej rezerwacji
router.post('/reservations', authenticateToken, async (req, res) => {
	const { date, time, seats, additionalInfo, firstName, lastName, email } = req.body
	let userId = null

	if (req.user) {
		userId = req.user.userId
	}

	try {
		const existingReservations = await Reservation.findAll({
			where: {
				date,
				time,
				seats: {
					[Op.gte]: seats,
				},
			},
		})

		if (existingReservations.length > 0) {
			return res.status(400).json({ error: 'Termin niedostępny. Wybierz inny czas.' })
		}

		const newReservation = await Reservation.create({
			date,
			time,
			seats,
			additionalInfo,
			firstName: userId ? null : firstName,
			lastName: userId ? null : lastName,
			email: userId ? null : email,
			userId,
		})

		res.status(201).json(newReservation)
	} catch (err) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do usuwania rezerwacji
router.delete('/reservations/:id', authenticateToken, async (req, res) => {
	try {
		const reservation = await Reservation.findByPk(req.params.id)

		if (!reservation) {
			return res.status(404).json({ error: 'Rezerwacja nie znaleziona' })
		}

		if (reservation.userId !== req.user.userId) {
			return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej rezerwacji' })
		}

		await reservation.destroy()
		res.json({ message: 'Rezerwacja usunięta' })
	} catch (err) {
		console.error('Error deleting reservation:', err)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// Endpoint do pobierania rezerwacji użytkownika
router.get('/reservations', authenticateToken, async (req, res) => {
	try {
		const reservations = await Reservation.findAll({ where: { userId: req.user.userId } })
		console.log('Reservations for user:', reservations) // Logowanie danych rezerwacji
		res.json(reservations)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
