const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./user')

const VerificationToken = sequelize.define(
	'VerificationToken',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: 'id',
			},
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = VerificationToken
