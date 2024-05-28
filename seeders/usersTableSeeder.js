const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const createUsersTable = async () => {
	await sequelize.getQueryInterface().createTable('Users', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
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
		profilePicture: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM('normal-user', 'admin'),
			allowNull: false,
			defaultValue: 'normal-user',
		},
	})
}

createUsersTable().catch(console.error)
