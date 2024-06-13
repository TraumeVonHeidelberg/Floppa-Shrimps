const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')
const User = require('./user')
const Table = require('./table')

const Reservation = sequelize.define(
	'Reservation',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		time: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		seats: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		additionalInfo: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: User,
				key: 'id',
			},
		},
		tableId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Table,
				key: 'id',
			},
		},
		endTime: {
			type: DataTypes.TIME,
			allowNull: false,
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
				fields: ['tableId'],
			},
		],
	}
)

module.exports = Reservation
