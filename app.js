const { sequelize, createTriggers } = require('./config/database')
const express = require('express')
const path = require('path')
const session = require('express-session')
const menuRoutes = require('./routes/menuRoutes')
const testimonialRoutes = require('./routes/testimonialRoutes')
const { router: authRoutes } = require('./routes/auth')
const reservationRoutes = require('./routes/reservationRoutes')
const tableRoutes = require('./routes/tableRoutes')
const newsRoutes = require('./routes/newsRoutes')
const adminRoutes = require('./routes/adminRoutes')

const app = express()

require('./associations')

app.use(express.json())

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Ustaw na true, jeśli używasz HTTPS
	})
)

app.use('/api', menuRoutes)
app.use('/api', testimonialRoutes)
app.use('/api', authRoutes)
app.use('/api', reservationRoutes)
app.use('/api', tableRoutes)
app.use('/api', newsRoutes)
app.use('/api', adminRoutes)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

const PORT = process.env.PORT || 3000

sequelize
	.sync()
	.then(() => {
		return createTriggers()
	})
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	})
	.catch(err => {
		console.error('Could not connect to the database:', err)
	})
