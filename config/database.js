const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, '../database.sqlite'),
	logging: console.log // Dodaje logowanie zapytań SQL
})

module.exports = sequelize
