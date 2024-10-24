const { DataTypes } = require('sequelize')
const {sequelize} = require('../config/database')
const News = require('./news')

const NewsHeaderText = sequelize.define(
	'NewsHeaderText',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true,
		},
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
			allowNull: false,
			references: {
				model: News,
				key: 'id',
			},
			onDelete: 'CASCADE',
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
				fields: ['newsId'],
			},
		],
	}
)

module.exports = NewsHeaderText
