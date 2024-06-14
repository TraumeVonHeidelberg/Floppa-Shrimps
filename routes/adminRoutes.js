const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const MenuItem = require('../models/menuItem')
const Testimonial = require('../models/testimonial')
const News = require('../models/news')
const NewsHeaderText = require('../models/newsHeaderText')
const Reservation = require('../models/reservation')
const User = require('../models/user')
const authenticateToken = require('../middleware/authenticateToken')
const multer = require('multer')
const path = require('path')
const { transporter } = require('./auth')

// Konfiguracja multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/img/uploads'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname)
	},
})
const upload = multer({ storage: storage })

// Dodajemy nową trasę do pobierania rezerwacji dla zalogowanych użytkowników
router.get('/reservations', authenticateToken, async (req, res) => {
	try {
		const reservations = await Reservation.findAll({
			where: { userId: req.user.userId },
			include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
		})
		res.status(200).json(reservations)
	} catch (error) {
		console.error('Error fetching reservations:', error)
		res.status(500).json({ error: 'Błąd serwera', details: error.message })
	}
})

router.post('/admin/menu', authenticateToken, async (req, res) => {
	try {
		const { name, description, price } = req.body
		const userId = req.user.userId // Pobieranie userId z tokenu
		const menuItem = await MenuItem.create({ name, description, price, userId })
		res.status(201).json(menuItem)
	} catch (error) {
		res.status(500).json({ message: 'Error adding menu item', error })
	}
})

router.post('/admin/testimonial', authenticateToken, async (req, res) => {
	try {
		const { text, author, company } = req.body
		const userId = req.user.userId // Pobieranie userId z tokenu
		const testimonial = await Testimonial.create({ text, author, company, userId })
		res.status(201).json(testimonial)
	} catch (error) {
		res.status(500).json({ message: 'Error adding testimonial', error })
	}
})

router.post('/admin/news', authenticateToken, upload.single('image'), async (req, res) => {
	try {
		const { category, title, introText, headers, texts } = req.body
		const userId = req.user.userId
		const image = req.file ? req.file.filename : null

		const news = await News.create({
			category,
			title,
			introText,
			image,
			userId,
		})

		const headersArray = JSON.parse(headers)
		const textsArray = JSON.parse(texts)

		for (let i = 0; i < headersArray.length; i++) {
			await NewsHeaderText.create({
				header: headersArray[i],
				text: textsArray[i],
				newsId: news.id,
			})
		}

		res.status(201).json({ message: 'News added successfully', news })
	} catch (error) {
		res.status(500).json({ message: 'Error adding news', error })
	}
})

router.put('/admin/menu/:id', authenticateToken, async (req, res) => {
	try {
		const { name, description, price } = req.body
		const { id } = req.params
		const menuItem = await MenuItem.findByPk(id)
		if (!menuItem) {
			return res.status(404).json({ message: 'Menu item not found' })
		}

		menuItem.name = name || menuItem.name
		menuItem.description = description || menuItem.description
		menuItem.price = price || menuItem.price

		await menuItem.save()
		res.status(200).json(menuItem)
	} catch (error) {
		res.status(500).json({ message: 'Error editing menu item', error })
	}
})

router.put('/admin/testimonial/:id', authenticateToken, async (req, res) => {
	try {
		const { text, author, company } = req.body
		const { id } = req.params
		const testimonial = await Testimonial.findByPk(id)
		if (!testimonial) {
			return res.status(404).json({ message: 'Testimonial not found' })
		}

		testimonial.text = text || testimonial.text
		testimonial.author = author || testimonial.author
		testimonial.company = company || testimonial.company

		await testimonial.save()
		res.status(200).json(testimonial)
	} catch (error) {
		res.status(500).json({ message: 'Error editing testimonial', error })
	}
})

router.put('/admin/news/:id', authenticateToken, async (req, res) => {
	const { category, title, introText, header, text, index } = req.body
	try {
		const news = await News.findByPk(req.params.id)
		if (!news) {
			return res.status(404).json({ message: 'News not found' })
		}

		if (category) news.category = category
		if (title) news.title = title
		if (introText) news.introText = introText

		await news.save()

		if ((header !== undefined || text !== undefined) && index !== undefined) {
			const headers = await NewsHeaderText.findAll({ where: { newsId: news.id } })
			if (headers[index]) {
				if (header !== undefined) headers[index].header = header
				if (text !== undefined) headers[index].text = text
				await headers[index].save()
			} else {
				console.error(`No header found at index ${index} for news ID ${news.id}`)
				return res.status(400).json({ message: `Invalid index ${index}` })
			}
		}

		res.status(200).json(news)
	} catch (error) {
		res.status(500).json({ message: 'Error editing news', error })
	}
})

router.delete('/admin/:type/:id', authenticateToken, async (req, res) => {
	const { type, id } = req.params
	let Model
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
		const item = await Model.findByPk(id)
		if (!item) {
			return res.status(404).json({ message: `${type} not found` })
		}

		// Jeśli typem jest rezerwacja, wysyłamy e-mail do użytkownika
		if (type === 'reservation') {
			const user = await User.findByPk(item.userId)
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: user.email,
				subject: 'Anulowanie rezerwacji',
				text: `Twoja rezerwacja na dzień ${item.date} o godzinie ${item.time} została anulowana przez administratora.`,
			}
			await transporter.sendMail(mailOptions)
		}

		await item.destroy()
		res.status(200).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully` })
	} catch (error) {
		res.status(500).json({ message: `Error deleting ${type}`, error })
	}
})

module.exports = router
