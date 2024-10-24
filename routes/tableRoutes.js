const express = require('express')
const router = express.Router()
const Table = require('../models/table')

// Endpoint to fetch the maximum number of seats
router.get('/tables/max-seats', async (req, res) => {
	try {
		// Query the database to find the maximum number of seats in any table
		const maxSeats = await Table.max('seats')
		// Return the maximum number of seats as a JSON response
		res.json({ maxSeats })
	} catch (error) {
		// Log the error to the console
		console.error('Error fetching max seats:', error)
		// Return a 500 status code with an error message if an error occurs
		res.status(500).json({ error: 'Server error' })
	}
})

module.exports = router
