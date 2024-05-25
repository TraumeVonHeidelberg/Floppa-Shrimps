const express = require('express')
const router = express.Router()
const MenuItem = require('../models/menuItem')

// Endpoint do pobierania wszystkich pozycji menu
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

// Endpoint do usuwania pozycji menu
router.delete('/menu/:id', async (req, res) => {
	try {
		const id = req.params.id
		const item = await MenuItem.findByPk(id)
		if (!item) {
			return res.status(404).json({ message: 'Pozycja nie znaleziona' })
		}
		await item.destroy()
		res.json({ message: 'Pozycja usunięta' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
