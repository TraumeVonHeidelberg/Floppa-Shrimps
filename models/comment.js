const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Comment = sequelize.define('Comment', {
	text: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	newsId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
})

module.exports = Comment
