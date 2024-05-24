// models/testimonial.js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Testimonial = sequelize.define('Testimonial', {
	text: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	author: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	company: {
		type: DataTypes.STRING,
		allowNull: true,
	},
})

module.exports = Testimonial
