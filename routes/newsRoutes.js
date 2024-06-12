const express = require('express');
const router = express.Router();
const News = require('../models/news');
const NewsHeaderText = require('../models/newsHeaderText');
const User = require('../models/user');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');

// Konfiguracja multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

// Logowanie przy każdym żądaniu do /api/news
router.use((req, res, next) => {
    console.log(`Request received at /api/news: ${req.method} ${req.originalUrl}`);
    next();
});

// Endpoint do dodawania newsów
router.post('/news', authenticateToken, upload.single('image'), async (req, res) => {
    const { category, title, introText, headers, texts } = req.body;
    const userId = req.user.userId;
    const image = req.file ? req.file.filename : null;

    try {
        const news = await News.create({
            category,
            title,
            introText,
            image,
            userId,
        });

        const headersArray = JSON.parse(headers);
        const textsArray = JSON.parse(texts);

        for (let i = 0; i < headersArray.length; i++) {
            await NewsHeaderText.create({
                header: headersArray[i],
                text: textsArray[i],
                newsId: news.id,
            });
        }

        res.status(201).json({ message: 'News added successfully', news });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint do pobierania najnowszych newsów
router.get('/news/latest', async (req, res) => {
    try {
        const news = await News.findAll({
            limit: 3,
            order: [['createdAt', 'DESC']],
            include: [
                { model: NewsHeaderText, as: 'headers' },
                { model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
            ],
        });

        console.log('Fetched news:', news);
        res.status(200).json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint do pobierania pełnego newsa
router.get('/news/:id', async (req, res) => {
    try {
        const news = await News.findOne({
            where: { id: req.params.id },
            include: [
                { model: NewsHeaderText, as: 'headers' },
                { model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
            ],
        });

        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.status(200).json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint do pobierania wszystkich newsów
router.get('/news', async (req, res) => {
    try {
        const news = await News.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: NewsHeaderText, as: 'headers' },
                { model: User, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
            ],
        });

        console.log('Fetched all news:', news);
        res.status(200).json(news);
    } catch (error) {
        console.error('Error fetching all news:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
