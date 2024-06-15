const { sequelize } = require('../config/database')
const Testimonial = require('../models/testimonial')

const testimonials = [
	{
		text: 'Floppa Shirmps & Cement to prawdziwa perełka na mapie gastronomicznej. Restauracja zachwyca nie tylko wyjątkowym smakiem dań, ale także ich estetycznym podaniem. Świeżość owoców morza jest tutaj bezdyskusyjna.',
		author: 'Mateusz Dyląg',
		company: 'Food Paradise',
		userId: 1, // Domyślnie ustawiony userId
	},
	{
		text: 'Floppa Shrimps & Cement to miejsce, które powinno znaleźć się na liście każdego miłośnika owoców morza. Restauracja oferuje niesamowite doświadczenia kulinarne, z daniami, które zachwycają smakiem i precyzją wykonania.',
		author: 'Melvin Harris',
		company: 'Grove Numer 9',
		userId: 1, // Domyślnie ustawiony userId
	},
	{
		text: 'Floppa Shrimps & Cement wyznacza nowe standardy w serwowaniu owoców morza. Restauracja oferuje dania, które są nie tylko świeże, ale również przygotowane z niezwykłą dbałością o szczegóły.',
		author: 'Lance Wilson',
		company: 'San Fierro',
		userId: 1, // Domyślnie ustawiony userId
	},
	{
		text: 'Floppa Shrimps & Cement to synonim doskonałości w kuchni morskiej. Dania są nie tylko wyśmienite, ale także pięknie podane, co podkreśla ich wyjątkowy charakter.',
		author: 'Frank Tenpenny',
		company: 'C.R.A.S.H',
		userId: 1, // Domyślnie ustawiony userId
	},
]

// This function seeds the database with sample testimonials.
// It performs the following steps:
// 1. Uses the bulkCreate method of the Testimonial model to create multiple testimonials in the database.
// 2. Logs a message indicating that the database has been seeded.
// 3. Closes the database connection.
// If an error occurs during any of these steps, it logs the error and closes the database connection.
async function seedDatabase() {
	try {
		// Create multiple testimonials in the database using the bulkCreate method
		await Testimonial.bulkCreate(testimonials)

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
