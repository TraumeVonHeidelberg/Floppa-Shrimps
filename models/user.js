const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define(
	'User',
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		profilePicture: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM('normal-user', 'admin'),
			allowNull: false,
			defaultValue: 'normal-user',
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = User
