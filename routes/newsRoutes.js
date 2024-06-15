const express = require('express')
const router = express.Router()
//The Op object in Sequelize is used to create complex query conditions using operators.
const { Op } = require('sequelize')
const News = require('../models/news')
const NewsHeaderText = require('../models/newsHeaderText')
const User = require('../models/user')
const Comment = require('../models/comment')
const authenticateToken = require('../middleware/authenticateToken')
const multer = require('multer')
const path = require('path')

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

// // Logowanie przy każdym żądaniu do /api/news
// router.use((req, res, next) => {
// 	console.log(`Request received at /api/news: ${req.method} ${req.originalUrl}`)
// 	next()
// })

// Endpoint for adding news
router.post('/news', authenticateToken, upload.single('image'), async (req, res) => {
	const { category, title, introText, headers, texts } = req.body
	const userId = req.user.userId
	const image = req.file ? req.file.filename : null

	try {
		// Create the news entry
		const news = await News.create({
			category,
			title,
			introText,
			image,
			userId,
		})

		// Parse and add headers and texts
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
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for adding comments
router.post('/news/:id/comments', authenticateToken, async (req, res) => {
	const { text } = req.body
	const userId = req.user.userId
	const newsId = req.params.id

	console.log(`Received comment: ${text} for newsId: ${newsId} from userId: ${userId}`)

	try {
		// Create the comment entry
		const comment = await Comment.create({
			text,
			userId,
			newsId,
		})

		console.log(`Comment added: ${comment.text} for newsId: ${comment.newsId} from userId: ${comment.userId}`)

		// Include the permissions in the response
		const commentWithPermissions = {
			...comment.toJSON(),
			canEdit: true,
			canDelete: true,
		}

		res.status(201).json(commentWithPermissions)
	} catch (error) {
		console.error('Error adding comment:', error)
		res.status(500).json({ message: 'Error adding comment' })
	}
})

// Endpoint for fetching comments
router.get('/news/:id/comments', authenticateToken, async (req, res) => {
	const newsId = req.params.id
	const userId = req.user ? req.user.userId : null
	const userRole = req.user ? req.user.role : null

	console.log(`Fetching comments for newsId: ${newsId}`)
	if (userId) {
		console.log(`Request made by user: ${userId} with role: ${userRole}`)
	} else {
		console.log('Request made by an unauthenticated user')
	}

	try {
		const comments = await Comment.findAll({
			where: { newsId },
			include: [{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'username', 'profilePicture'] }],
		})

		console.log(`Fetched comments: ${comments.length} comments found`)

		const commentsWithPermissions = comments.map(comment => {
			const commentJson = comment.toJSON()
			commentJson.canDelete = comment.userId === userId || userRole === 'admin'
			commentJson.canEdit = comment.userId === userId
			console.log(
				`Comment ID: ${comment.id}, User ID: ${comment.userId}, canDelete: ${commentJson.canDelete}, canEdit: ${commentJson.canEdit}`
			)
			return commentJson
		})

		res.status(200).json(commentsWithPermissions)
	} catch (error) {
		console.error('Error fetching comments:', error)
		res.status(500).json({ message: 'Error fetching comments' })
	}
})

// Endpoint for deleting comments
router.delete('/news/:newsId/comments/:commentId', authenticateToken, async (req, res) => {
	const { commentId } = req.params
	const userId = req.user.userId

	try {
		// Find the comment by ID
		const comment = await Comment.findByPk(commentId)
		if (!comment) {
			return res.status(404).json({ error: 'Comment not found' })
		}

		// Check if the user is the owner of the comment or an admin
		if (comment.userId !== userId && req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Unauthorized' })
		}

		// Delete the comment
		await comment.destroy()
		res.json({ message: 'Comment deleted' })
	} catch (error) {
		console.error('Error deleting comment:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// Endpoint for editing comments
router.put('/news/:newsId/comments/:commentId', authenticateToken, async (req, res) => {
	const { commentId } = req.params
	const { text } = req.body
	const userId = req.user.userId

	try {
		// Find the comment by ID
		const comment = await Comment.findByPk(commentId)
		if (!comment) {
			return res.status(404).json({ error: 'Comment not found' })
		}

		// Check if the user is the owner of the comment
		if (comment.userId !== userId) {
			return res.status(403).json({ error: 'Unauthorized' })
		}

		// Update the comment text
		comment.text = text
		await comment.save()
		res.json({ message: 'Comment updated' })
	} catch (error) {
		console.error('Error updating comment:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// Endpoint for fetching the latest 3 news
router.get('/news/latest', async (req, res) => {
	try {
		// Fetch the latest 3 news entries
		const news = await News.findAll({
			limit: 3,
			order: [['createdAt', 'DESC']],
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		console.log('Fetched news:', news)
		res.status(200).json(news)
	} catch (error) {
		console.error('Error fetching news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for fetching the latest 5 news
router.get('/news/latest/5', async (req, res) => {
	try {
		// Fetch the latest 5 news entries
		const news = await News.findAll({
			limit: 5,
			order: [['createdAt', 'DESC']],
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		console.log('Fetched news:', news)
		res.status(200).json(news)
	} catch (error) {
		console.error('Error fetching news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for fetching a single news entry by ID
router.get('/news/:id', async (req, res) => {
	try {
		// Fetch the news entry by ID
		const news = await News.findOne({
			where: { id: req.params.id },
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		if (!news) {
			return res.status(404).json({ message: 'News not found' })
		}

		res.status(200).json(news)
	} catch (error) {
		console.error('Error fetching news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for fetching all news entries
router.get('/news', async (req, res) => {
	try {
		// Fetch all news entries
		const news = await News.findAll({
			order: [['createdAt', 'DESC']],
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		// Dynamically set the image paths
		const newsWithImagePaths = news.map(item => {
			if (item.image) {
				item.image = `/img/uploads/${item.image}`
			}
			return item
		})

		console.log('Fetched all news:', newsWithImagePaths)
		res.status(200).json(newsWithImagePaths)
	} catch (error) {
		console.error('Error fetching all news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for uploading an image for a news entry
router.post('/news/:id/image', authenticateToken, upload.single('image'), async (req, res) => {
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

// Endpoint for updating a news entry
router.put('/news/:id', authenticateToken, async (req, res) => {
	const { category, title, introText, header, text, index } = req.body
	try {
		// Find the news entry by ID
		const news = await News.findByPk(req.params.id)
		if (!news) {
			return res.status(404).json({ message: 'News not found' })
		}

		// Update the main fields of the news entry
		if (category) news.category = category
		if (title) news.title = title
		if (introText) news.introText = introText

		await news.save()

		// Update headers and texts if provided
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
		console.error('Error updating news:', error)
		res.status(500).json({ message: 'Error updating news' })
	}
})

// Endpoint for deleting a news entry
router.delete('/news/:id', authenticateToken, async (req, res) => {
	try {
		// Find the news entry by ID
		const news = await News.findByPk(req.params.id)
		if (!news) {
			return res.status(404).json({ message: 'News not found' })
		}

		// Delete the news entry
		await News.destroy({
			where: { id: req.params.id },
		})
		res.status(200).json({ message: 'News deleted successfully' })
	} catch (error) {
		console.error('Error deleting news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for fetching the previous news entry
router.get('/news/:id/previous', async (req, res) => {
	try {
		// Find the previous news entry by ID
		const news = await News.findOne({
			where: { id: { [Op.lt]: req.params.id } },
			order: [['id', 'DESC']],
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		if (!news) {
			return res.status(404).json({ message: 'No previous news found' })
		}

		res.status(200).json(news)
	} catch (error) {
		console.error('Error fetching previous news:', error)
		res.status(500).json({ message: error.message })
	}
})

// Endpoint for fetching the next news entry
router.get('/news/:id/next', async (req, res) => {
	try {
		// Find the next news entry by ID
		const news = await News.findOne({
			where: { id: { [Op.gt]: req.params.id } },
			order: [['id', 'ASC']],
			include: [
				{ model: NewsHeaderText, as: 'headers' },
				{ model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
			],
		})

		if (!news) {
			return res.status(404).json({ message: 'No next news found' })
		}

		res.status(200).json(news)
	} catch (error) {
		console.error('Error fetching next news:', error)
		res.status(500).json({ message: error.message })
	}
})

module.exports = router
