const express = require('express')
const router = express.Router()
const Testimonial = require('../models/testimonial')

// Endpoint do pobierania wszystkich opinii
router.get('/testimonials', async (req, res) => {
	try {
		const testimonials = await Testimonial.findAll()
		res.json(testimonials)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Endpoint do dodawania nowej opinii
router.post('/testimonials', async (req, res) => {
	const { text, author, company } = req.body
	try {
		const newTestimonial = await Testimonial.create({ text, author, company })
		res.status(201).json(newTestimonial)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// Endpoint do usuwania opinii
router.delete('/testimonials/:id', async (req, res) => {
	try {
		const id = req.params.id
		const testimonial = await Testimonial.findByPk(id)
		if (!testimonial) {
			return res.status(404).json({ message: 'Testimonial nie znaleziony' })
		}
		await testimonial.destroy()
		res.json({ message: 'Testimonial usunięty' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Endpoint do aktualizacji opinii
router.put('/testimonials/:id', async (req, res) => {
	const { text, author, company } = req.body
	try {
		const testimonial = await Testimonial.findByPk(req.params.id)
		if (!testimonial) {
			return res.status(404).json({ message: 'Testimonial nie znaleziony' })
		}
		testimonial.text = text
		testimonial.author = author
		testimonial.company = company
		await testimonial.save()
		res.json(testimonial)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
