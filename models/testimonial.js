const { DataTypes } = require('sequelize')
const {sequelize} = require('../config/database')
const User = require('./user')

const Testimonial = sequelize.define(
	'Testimonial',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true,
		},
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
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
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
		],
	}
)

module.exports = Testimonial
