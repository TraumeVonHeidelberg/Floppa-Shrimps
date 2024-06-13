const { sequelize } = require('../config/database')
const Table = require('../models/table')

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

const seedTables = async () => {
	try {
		await Table.bulkCreate(tables)
		console.log('Tables have been seeded.')
		process.exit()
	} catch (error) {
		console.error('Error seeding tables:', error)
		process.exit(1)
	}
}

seedTables()
