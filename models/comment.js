const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database') 
const User = require('./user') 
const News = require('./news') 

const Comment = sequelize.define(
	'Comment',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true,
		},
		text: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Users', // Użycie nazwy tabeli jako string
				key: 'id',
			},
		},
		newsId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'News', // Użycie nazwy tabeli jako string
				key: 'id',
			},
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		timestamps: true,
		indexes: [
			{
				fields: ['userId'],
			},
			{
				fields: ['newsId'],
			},
		],
	}
)

module.exports = Comment
