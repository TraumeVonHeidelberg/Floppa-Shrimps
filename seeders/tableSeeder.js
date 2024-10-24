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

/**
 * This function seeds the database with sample table data.
 * It uses the Table model to bulk create the tables in the database.
 * If an error occurs, it logs the error and exits the process with a status code of 1.
 * If the seeding is successful, it logs a success message and exits the process with a status code of 0.
 */
const seedTables = async () => {
	try {
		// Use the Table model to bulk create the tables in the database
		await Table.bulkCreate(tables)

		// Log a message indicating that the tables have been seeded
		console.log('Tables have been seeded.')

		// Exit the process with a status code of 0 to indicate a successful seeding
		process.exit(0)
	} catch (error) {
		// Log the error that occurred during the seeding process
		console.error('Error seeding tables:', error)

		// Exit the process with a status code of 1 to indicate a failed seeding
		process.exit(1)
	}
}

seedTables()
