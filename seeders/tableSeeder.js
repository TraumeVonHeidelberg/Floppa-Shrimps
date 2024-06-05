const sequelize = require('../config/database')
const Table = require('../models/table')

const seedTables = async () => {
	await sequelize.sync({ force: true }) // Wyczyść istniejącą bazę danych

	const tables = [
		{ seats: 4 },
		{ seats: 6 },
		{ seats: 2 },
		{ seats: 8 },
		{ seats: 4 },
		{ seats: 4 },
		{ seats: 6 },
		{ seats: 10 },
	]

	for (const table of tables) {
		await Table.create(table)
	}

	console.log('Tables have been seeded.')
	process.exit()
}

seedTables().catch(error => {
	console.error('Error seeding tables:', error)
	process.exit(1)
})
