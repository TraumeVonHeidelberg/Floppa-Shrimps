const express = require('express')
const router = express.Router()
const Testimonial = require('../models/testimonial')

// Endpoint do pobierania wszystkich testimonials
router.get('/testimonials', async (req, res) => {
	try {
		const testimonials = await Testimonial.findAll()
		res.json(testimonials)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Endpoint do dodawania nowego testimonial
router.post('/testimonials', async (req, res) => {
	const { text, author, company } = req.body
	try {
		const newTestimonial = await Testimonial.create({ text, author, company })
		res.status(201).json(newTestimonial)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

module.exports = router
