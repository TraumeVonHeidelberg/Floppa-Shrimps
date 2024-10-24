const express = require('express')
const router = express.Router()
const MenuItem = require('../models/menuItem')

// Endpoint to fetch all menu items
router.get('/menu', async (req, res) => {
	try {
		const menuItems = await MenuItem.findAll() // Fetch all menu items from the database
		res.json(menuItems) // Send the menu items as a JSON response
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to add a new menu item
router.post('/menu', async (req, res) => {
	const { name, description, price } = req.body
	try {
		const newItem = await MenuItem.create({ name, description, price }) // Create a new menu item in the database
		res.status(201).json(newItem) // Send the newly created item as a JSON response with a 201 status code
	} catch (err) {
		res.status(400).json({ message: err.message }) // Send a 400 error if there is a client issue
	}
})

// Endpoint to delete a menu item
router.delete('/menu/:id', async (req, res) => {
	try {
		const id = req.params.id
		const item = await MenuItem.findByPk(id) // Find the menu item by primary key (id)
		if (!item) {
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		await item.destroy() // Delete the menu item from the database
		res.json({ message: 'Item deleted' }) // Send a success message
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to update a menu item
router.put('/menu/:id', async (req, res) => {
	const { name, description, price } = req.body
	console.log(`Updating menu item: id=${req.params.id}, name=${name}, description=${description}, price=${price}`)
	try {
		const item = await MenuItem.findByPk(req.params.id) // Find the menu item by primary key (id)
		if (!item) {
			console.error('Item not found')
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		item.name = name // Update the item's name
		item.description = description // Update the item's description
		item.price = price // Update the item's price
		await item.save() // Save the updated item to the database
		res.json(item) // Send the updated item as a JSON response
	} catch (err) {
		console.error('Error updating item:', err)
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

module.exports = router // Export the router// Endpoint to fetch all menu items
router.get('/menu', async (req, res) => {
	try {
		const menuItems = await MenuItem.findAll() // Fetch all menu items from the database
		res.json(menuItems) // Send the menu items as a JSON response
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to add a new menu item
router.post('/menu', async (req, res) => {
	const { name, description, price } = req.body
	try {
		const newItem = await MenuItem.create({ name, description, price }) // Create a new menu item in the database
		res.status(201).json(newItem) // Send the newly created item as a JSON response with a 201 status code
	} catch (err) {
		res.status(400).json({ message: err.message }) // Send a 400 error if there is a client issue
	}
})

// Endpoint to delete a menu item
router.delete('/menu/:id', async (req, res) => {
	try {
		const id = req.params.id
		const item = await MenuItem.findByPk(id) // Find the menu item by primary key (id)
		if (!item) {
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		await item.destroy() // Delete the menu item from the database
		res.json({ message: 'Item deleted' }) // Send a success message
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to update a menu item
router.put('/menu/:id', async (req, res) => {
	const { name, description, price } = req.body
	console.log(`Updating menu item: id=${req.params.id}, name=${name}, description=${description}, price=${price}`)
	try {
		const item = await MenuItem.findByPk(req.params.id) // Find the menu item by primary key (id)
		if (!item) {
			console.error('Item not found')
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		item.name = name // Update the item's name
		item.description = description // Update the item's description
		item.price = price // Update the item's price
		await item.save() // Save the updated item to the database
		res.json(item) // Send the updated item as a JSON response
	} catch (err) {
		console.error('Error updating item:', err)
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

module.exports = router // Export the router// Endpoint to fetch all menu items
router.get('/menu', async (req, res) => {
	try {
		const menuItems = await MenuItem.findAll() // Fetch all menu items from the database
		res.json(menuItems) // Send the menu items as a JSON response
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to add a new menu item
router.post('/menu', async (req, res) => {
	const { name, description, price } = req.body
	try {
		const newItem = await MenuItem.create({ name, description, price }) // Create a new menu item in the database
		res.status(201).json(newItem) // Send the newly created item as a JSON response with a 201 status code
	} catch (err) {
		res.status(400).json({ message: err.message }) // Send a 400 error if there is a client issue
	}
})

// Endpoint to delete a menu item
router.delete('/menu/:id', async (req, res) => {
	try {
		const id = req.params.id
		const item = await MenuItem.findByPk(id) // Find the menu item by primary key (id)
		if (!item) {
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		await item.destroy() // Delete the menu item from the database
		res.json({ message: 'Item deleted' }) // Send a success message
	} catch (err) {
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

// Endpoint to update a menu item
router.put('/menu/:id', async (req, res) => {
	const { name, description, price } = req.body
	console.log(`Updating menu item: id=${req.params.id}, name=${name}, description=${description}, price=${price}`)
	try {
		const item = await MenuItem.findByPk(req.params.id) // Find the menu item by primary key (id)
		if (!item) {
			console.error('Item not found')
			return res.status(404).json({ message: 'Item not found' }) // Send a 404 error if the item is not found
		}
		item.name = name // Update the item's name
		item.description = description // Update the item's description
		item.price = price // Update the item's price
		await item.save() // Save the updated item to the database
		res.json(item) // Send the updated item as a JSON response
	} catch (err) {
		console.error('Error updating item:', err)
		res.status(500).json({ message: err.message }) // Send a 500 error if there is a server issue
	}
})

module.exports = router // Export the router
