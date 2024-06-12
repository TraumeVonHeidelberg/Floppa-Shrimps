const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const News = require('./news') // Importuj model News, aby odnieść się do klucza obcego

const NewsHeaderText = sequelize.define(
	'NewsHeaderText',
	{
		header: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		text: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		newsId: {
			type: DataTypes.INTEGER,
			references: {
				model: News,
				key: 'id',
			},
			onDelete: 'CASCADE',
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = NewsHeaderText
