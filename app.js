require('dotenv').config()

const express = require('express')
const sequelize = require('./config/database')
const path = require('path')
const session = require('express-session')
const menuRoutes = require('./routes/menuRoutes')
const testimonialRoutes = require('./routes/testimonialRoutes')
const { router: authRoutes } = require('./routes/auth') // Użyj destructuring do importu routera
const reservationRoutes = require('./routes/reservationRoutes')
const tableRoutes = require('./routes/tableRoutes');

const app = express()

// Importowanie asocjacji
require('./associations')

// Middleware do parsowania JSON
app.use(express.json())

// Konfiguracja sesji
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Ustaw na true, jeśli używasz HTTPS
	})
)

// Routing
app.use('/api', menuRoutes)
app.use('/api', testimonialRoutes)
app.use('/api', authRoutes)
app.use('/api', reservationRoutes)
app.use('/api', tableRoutes);
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'))
})

// Endpoint dla panelu administracyjnego
app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

const PORT = process.env.PORT || 3000

sequelize
	.sync()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	})
	.catch(err => {
		console.error('Could not connect to the database:', err)
	})
