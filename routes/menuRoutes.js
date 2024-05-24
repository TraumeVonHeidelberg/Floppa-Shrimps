const express = require('express')
const router = express.Router()
const MenuItem = require('../models/menuItem')

router.get('/menu', async (req, res) => {
	try {
		const menuItems = await MenuItem.findAll()
		res.json(menuItems)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Endpoint do dodawania nowej pozycji do menu
router.post('/menu', async (req, res) => {
	const { name, description, price } = req.body
	try {
		const newItem = await MenuItem.create({ name, description, price })
		res.status(201).json(newItem)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

module.exports = router
