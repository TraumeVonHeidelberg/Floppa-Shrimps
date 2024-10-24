const { sequelize } = require('../config/database')
const MenuItem = require('../models/menuItem')

const menuItems = [
	{ name: "Floppa's Shrimp Fiesta", description: 'Krewetki, awokado, mango', price: 24.0, userId: 1 },
	{ name: "Floppa's Sea Delight", description: 'Ostrygi, granat, rukola, ser feta', price: 35.0, userId: 1 },
	{ name: "Big Floppa's Ocean Pasta", description: 'Makaron tagliatelle, małże, kalmary', price: 28.0, userId: 1 },
	{ name: "Floppa's Crab Royale", description: 'Kraby, kremowy sos serowy, szparagi', price: 48.0, userId: 1 },
	{
		name: "Big Floppa's Seafood Medley",
		description: 'Krewetki, małże, przegrzebki, wędzony łosoś',
		price: 56.0,
		userId: 1,
	},
	{
		name: "Big Floppa's Grilled Octopus",
		description: 'Ośmiornica, pieczone ziemniaki, sos z czerwonego wina',
		price: 62.0,
		userId: 1,
	},
	{
		name: "Floppa's Shrimp and Raspberry Delight",
		description: 'Krewetki, maliny, rukola, ser kozi, orzechy włoskie',
		price: 46.0,
		userId: 1,
	},
	{
		name: "Big Floppa's Fisherman's Platter",
		description: 'Krewetki, kalmary, małże, frytki z batatów',
		price: 32.0,
		userId: 1,
	},
	{
		name: "Floppa's Creamy Seafood Soup",
		description: 'Krewetki, małże, przegrzebki, kremowy bulion z białego wina',
		price: 46.0,
		userId: 1,
	},
	{
		name: "Floppa's Spicy Shrimp Bowl",
		description: 'Krewetki, ryż jaśminowy, papryka, ananas',
		price: 38.0,
		userId: 1,
	},
	{
		name: "Floppa's Shrimp and Citrus Salad",
		description: 'Krewetki, grejpfrut, pomarańcze, awokado',
		price: 29.0,
		userId: 1,
	},
	{
		name: "Floppa's Mango Shrimp Tacos",
		description: 'Krewetki, salsa mango, czerwona cebula, kolendra',
		price: 24.0,
		userId: 1,
	},
]

/**
 * This function seeds the database with sample menu items.
 * It synchronizes the database, formats the price values, 
 * and bulk creates the menu items in the database.
 * If an error occurs, it logs the error and closes the database connection.
 */
async function seedDatabase() {
	try {
		// Synchronize the database, but without forcing the deletion of tables
		await sequelize.sync({ alter: true })
		
		// Format the price values to two decimal places
		const formattedMenuItems = menuItems.map(item => {
			return { ...item, price: item.price.toFixed(2) }
		})
		
		// Bulk create the menu items in the database
		await MenuItem.bulkCreate(formattedMenuItems)
		
		// Log a message indicating that the database has been seeded
		console.log('Database seeded!')
		
		// Close the database connection
		sequelize.close()
	} catch (err) {
		// Log the error that occurred during the seeding process
		console.error('Error seeding database:', err)
		
		// Close the database connection
		sequelize.close()
	}
}

seedDatabase()
