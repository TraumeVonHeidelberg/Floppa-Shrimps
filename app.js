const express = require('express')
const sequelize = require('./config/database')
const path = require('path')
const menuRoutes = require('./routes/menuRoutes')
const testimonialRoutes = require('./routes/testimonialRoutes')
const authRoutes = require('./routes/auth')

const app = express()

app.use(express.json())
app.use('/api', menuRoutes)
app.use('/api', testimonialRoutes)
app.use('/api', authRoutes)
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
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	})
	.catch(err => {
		console.error('Could not connect to the database:', err)
	})
