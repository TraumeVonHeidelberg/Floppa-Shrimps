const express = require('express')
const router = express.Router()
const Testimonial = require('../models/testimonial')

// Endpoint to fetch all testimonials
router.get('/testimonials', async (req, res) => {
	try {
		// Fetch all testimonials from the database
		const testimonials = await Testimonial.findAll()
		// Return the fetched testimonials in JSON format
		res.json(testimonials)
	} catch (err) {
		// Return a 500 status code with an error message if an error occurs
		res.status(500).json({ message: err.message })
	}
})

// Endpoint to add a new testimonial
router.post('/testimonials', async (req, res) => {
	// Extract text, author, and company from the request body
	const { text, author, company } = req.body
	try {
		// Create a new testimonial in the database
		const newTestimonial = await Testimonial.create({ text, author, company })
		// Return the created testimonial with a 201 status code
		res.status(201).json(newTestimonial)
	} catch (err) {
		// Return a 400 status code with an error message if an error occurs
		res.status(400).json({ message: err.message })
	}
})

// Endpoint to delete a testimonial
router.delete('/testimonials/:id', async (req, res) => {
	try {
		// Extract the testimonial ID from the request parameters
		const id = req.params.id
		// Find the testimonial by its ID
		const testimonial = await Testimonial.findByPk(id)
		if (!testimonial) {
			// Return a 404 status code if the testimonial is not found
			return res.status(404).json({ message: 'Testimonial not found' })
		}
		// Delete the found testimonial
		await testimonial.destroy()
		// Return a success message
		res.json({ message: 'Testimonial deleted' })
	} catch (err) {
		// Return a 500 status code with an error message if an error occurs
		res.status(500).json({ message: err.message })
	}
})

// Endpoint to update a testimonial
router.put('/testimonials/:id', async (req, res) => {
	// Extract text, author, and company from the request body
	const { text, author, company } = req.body
	try {
		// Find the testimonial by its ID
		const testimonial = await Testimonial.findByPk(req.params.id)
		if (!testimonial) {
			// Return a 404 status code if the testimonial is not found
			return res.status(404).json({ message: 'Testimonial not found' })
		}
		// Update the testimonial's text, author, and company
		testimonial.text = text
		testimonial.author = author
		testimonial.company = company
		// Save the updated testimonial
		await testimonial.save()
		// Return the updated testimonial
		res.json(testimonial)
	} catch (err) {
		// Return a 500 status code with an error message if an error occurs
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
