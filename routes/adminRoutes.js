/*Express is a web application framework specifically designed for Node.js. It simplifies the process of building web applications and APIs by providing a set of powerful tools and features.
Express has a robust and straightforward routing mechanism. It allows you to define routes for different HTTP methods (GET, POST, PUT, DELETE, etc.) and specify what should happen when a request is made to a particular route.
*/
const express = require('express')
//router is a mini-application capable only of performing middleware and routing functions. It's a way to organize your application's routes and middleware in a modular and manageable way
const router = express.Router()
const MenuItem = require('../models/menuItem')
const Testimonial = require('../models/testimonial')
const News = require('../models/news')
const NewsHeaderText = require('../models/newsHeaderText')
const Reservation = require('../models/reservation')
const User = require('../models/user')
const authenticateToken = require('../middleware/authenticateToken')
//Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files in Node.js applications. It is designed to work with the Express web framework and helps in managing file uploads by parsing and storing them efficiently.
const multer = require('multer')
//path is a core module in Node.js that provides utilities for working with file and directory paths. It helps in handling and transforming file paths in a way that is compatible across different operating systems. This module comes bundled with Node.js
const path = require('path')
//transporter is an object configured to send emails using the nodemailer module
const { transporter } = require('./auth')

// Konfiguracja multer
const storage = multer.diskStorage({
	/*
		This function is called by multer to determine the destination directory
		for storing uploaded files. It takes three arguments:
			- req: The HTTP request object.
			- file: The multer file object representing the uploaded file.
			- cb: The callback function to be called with the destination directory.
		
		The destination directory is determined by joining the current directory
		with the relative path '../public/img/uploads'. The __dirname variable
		represents the directory of the current module.
	*/
	destination: function (req, file, cb) {
		// Join the current directory with the relative path to the uploads directory
		const uploadsDirectory = path.join(__dirname, '../public/img/uploads')

		// Call the callback function with the destination directory
		cb(null, uploadsDirectory)
	},

	//This function is called by multer to determine the name of the uploaded file.
	// It takes three arguments:
	//   - req: The HTTP request object.
	//   - file: The multer file object representing the uploaded file.
	//   - cb: The callback function to be called with the filename.
	//
	// The filename is determined by appending the current timestamp (in milliseconds)
	// to the original name of the uploaded file. The original name is obtained from
	// the 'originalname' property of the file object.
	//
	// The callback function is called with two arguments:
	//   - err: An error object, or null if there was no error.
	//   - filename: The filename to be used for the uploaded file.
	//
	// By calling the callback function with the determined filename, multer will
	// save the uploaded file with the specified filename in the destination directory
	// determined by the 'destination' function.
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname)
	},
})
const upload = multer({ storage: storage })

// Endpoint to fetch user reservations
router.get('/reservations', authenticateToken, async (req, res) => {
	try {
		// Fetching all reservations for the authenticated user
		const reservations = await Reservation.findAll({
			where: { userId: req.user.userId },
			include: [
				{
					model: User,
					as: 'user',
					attributes: ['firstName', 'lastName', 'email'],
				},
			],
		})
		res.status(200).json(reservations) // Sending the reservations data as JSON response
	} catch (error) {
		console.error('Error fetching reservations:', error)
		res.status(500).json({ error: 'Server error', details: error.message }) // Sending error response
	}
})

// Endpoint to add a new menu item
router.post('/admin/menu', authenticateToken, async (req, res) => {
	try {
		const { name, description, price } = req.body
		const userId = req.user.userId // Getting userId from the token

		// Creating a new menu item with the provided details
		const menuItem = await MenuItem.create({ name, description, price, userId })
		res.status(201).json(menuItem) // Sending the created menu item as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error adding menu item', error }) // Sending error response
	}
})
// Endpoint to add a new testimonial
router.post('/admin/testimonial', authenticateToken, async (req, res) => {
	try {
		const { text, author, company } = req.body
		const userId = req.user.userId // Getting userId from the token

		// Creating a new testimonial with the provided details
		const testimonial = await Testimonial.create({ text, author, company, userId })
		res.status(201).json(testimonial) // Sending the created testimonial as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error adding testimonial', error }) // Sending error response
	}
})
// Endpoint to add a new news item
router.post('/admin/news', authenticateToken, upload.single('image'), async (req, res) => {
	try {
		const { category, title, introText, headers, texts } = req.body
		const userId = req.user.userId // Getting userId from the token
		const image = req.file ? req.file.filename : null // Getting the uploaded image filename

		// Creating a new news item with the provided details
		const news = await News.create({ category, title, introText, image, userId })

		// Parsing the headers and texts arrays from JSON strings
		const headersArray = JSON.parse(headers)
		const textsArray = JSON.parse(texts)

		// Creating NewsHeaderText entries for each header and text
		for (let i = 0; i < headersArray.length; i++) {
			await NewsHeaderText.create({
				header: headersArray[i],
				text: textsArray[i],
				newsId: news.id,
			})
		}

		res.status(201).json({ message: 'News added successfully', news }) // Sending the created news item as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error adding news', error }) // Sending error response
	}
})

// Endpoint to edit a menu item
router.put('/admin/menu/:id', authenticateToken, async (req, res) => {
	try {
		const { name, description, price } = req.body
		const { id } = req.params // Getting the menu item ID from the request parameters

		// Finding the menu item by its primary key
		const menuItem = await MenuItem.findByPk(id)
		if (!menuItem) {
			return res.status(404).json({ message: 'Menu item not found' }) // Sending error response if item not found
		}

		// Updating the menu item's details if provided in the request body
		menuItem.name = name || menuItem.name
		menuItem.description = description || menuItem.description
		menuItem.price = price || menuItem.price

		await menuItem.save() // Saving the updated menu item
		res.status(200).json(menuItem) // Sending the updated menu item as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error editing menu item', error }) // Sending error response
	}
})

// Endpoint to edit a testimonial
router.put('/admin/testimonial/:id', authenticateToken, async (req, res) => {
	try {
		const { text, author, company } = req.body
		const { id } = req.params // Getting the testimonial ID from the request parameters

		// Finding the testimonial by its primary key
		const testimonial = await Testimonial.findByPk(id)
		if (!testimonial) {
			return res.status(404).json({ message: 'Testimonial not found' }) // Sending error response if item not found
		}

		// Updating the testimonial's details if provided in the request body
		testimonial.text = text || testimonial.text
		testimonial.author = author || testimonial.author
		testimonial.company = company || testimonial.company

		await testimonial.save() // Saving the updated testimonial
		res.status(200).json(testimonial) // Sending the updated testimonial as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error editing testimonial', error }) // Sending error response
	}
})

// Endpoint to edit a news item
router.put('/admin/news/:id', authenticateToken, async (req, res) => {
	const { category, title, introText, header, text, index } = req.body
	try {
		// Finding the news item by its primary key
		const news = await News.findByPk(req.params.id)
		if (!news) {
			return res.status(404).json({ message: 'News not found' }) // Sending error response if item not found
		}

		// Updating the news item's details if provided in the request body
		if (category) news.category = category
		if (title) news.title = title
		if (introText) news.introText = introText

		await news.save() // Saving the updated news item

		// Updating the news header texts if provided in the request body
		if ((header !== undefined || text !== undefined) && index !== undefined) {
			const headers = await NewsHeaderText.findAll({ where: { newsId: news.id } })
			if (headers[index]) {
				if (header !== undefined) headers[index].header = header
				if (text !== undefined) headers[index].text = text
				await headers[index].save() // Saving the updated header text
			} else {
				console.error(`No header found at index ${index} for news ID ${news.id}`)
				return res.status(400).json({ message: `Invalid index ${index}` }) // Sending error response if invalid index
			}
		}

		res.status(200).json(news) // Sending the updated news item as JSON response
	} catch (error) {
		res.status(500).json({ message: 'Error editing news', error }) // Sending error response
	}
})

// Endpoint for uploading an image for a news entry
router.post('/admin/news/:id/image', authenticateToken, upload.single('image'), async (req, res) => {
	try {
		// Find the news entry by ID
		const news = await News.findByPk(req.params.id)
		if (!news) {
			return res.status(404).json({ message: 'News not found' })
		}

		// Update the image field
		if (req.file) {
			news.image = req.file.filename
			await news.save()
		}

		res.status(200).json({ image: news.image })
	} catch (error) {
		console.error('Error updating news image:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint to delete an item (menu, testimonial, news, or reservation)
router.delete('/admin/:type/:id', authenticateToken, async (req, res) => {
	const { type, id } = req.params // Getting the item type and ID from the request parameters
	let Model // Declaring a variable to hold the model class
	switch (type) {
		case 'menu':
			Model = MenuItem
			break
		case 'testimonial':
			Model = Testimonial
			break
		case 'news':
			Model = News
			break
		case 'reservation':
			Model = Reservation
			break
		default:
			return res.status(400).json({ message: 'Invalid type' })
	}

	try {
		// Finding the item by its primary key
		const item = await Model.findByPk(id)
		if (!item) {
			return res.status(404).json({ message: `${type} not found` }) // Sending error response if item not found
		}

		// If the item is a reservation, send an email to the user (if exists)
		if (type === 'reservation' && item.userId) {
			const user = await User.findByPk(item.userId)
			if (user) {
				const mailOptions = {
					from: process.env.EMAIL_USER,
					to: user.email,
					subject: 'Anulowanie rezerwacji',
					text: `Twoja rezerwacja na dzień ${item.date} o godzinie ${item.time} została anulowana przez administratora.`,
				}
				await transporter.sendMail(mailOptions)
			}
		}
		// Deleting the item from the database
		await item.destroy()
		res.status(200).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully` })
	} catch (error) {
		res.status(500).json({ message: `Error deleting ${type}`, error })
	}
})

// Exporting the router module to be used in other parts of the application
module.exports = router
