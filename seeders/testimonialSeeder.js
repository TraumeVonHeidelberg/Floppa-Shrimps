// scripts/seedTestimonials.js
const sequelize = require('../config/database')
const Testimonial = require('../models/testimonial')

const testimonials = [
	{
		text: 'Floppa Shirmps & Cement to prawdziwa perełka na mapie gastronomicznej. Restauracja zachwyca nie tylko wyjątkowym smakiem dań, ale także ich estetycznym podaniem. Świeżość owoców morza jest tutaj bezdyskusyjna.',
		author: 'Mateusz Dyląg',
		company: 'Food Paradise',
	},
	{
		text: 'Floppa Shrimps & Cement to miejsce, które powinno znaleźć się na liście każdego miłośnika owoców morza. Restauracja oferuje niesamowite doświadczenia kulinarne, z daniami, które zachwycają smakiem i precyzją wykonania.',
		author: 'Melvin Harris',
		company: 'Grove Numer 9',
	},
	{
		text: 'Floppa Shrimps & Cement wyznacza nowe standardy w serwowaniu owoców morza. Restauracja oferuje dania, które są nie tylko świeże, ale również przygotowane z niezwykłą dbałością o szczegóły.',
		author: 'Lance Wilson',
		company: 'San Fierro',
	},
	{
		text: 'Floppa Shrimps & Cement to synonim doskonałości w kuchni morskiej. Dania są nie tylko wyśmienite, ale także pięknie podane, co podkreśla ich wyjątkowy charakter.',
		author: 'Frank Tenpenny',
		company: 'C.R.A.S.H',
	},
]

async function seedDatabase() {
	try {
		await sequelize.sync({ force: true }) // Upewnij się, że tabela została utworzona
		await Testimonial.bulkCreate(testimonials)
		console.log('Database seeded!')
		sequelize.close()
	} catch (err) {
		console.error('Error seeding database:', err)
		sequelize.close()
	}
}

seedDatabase()
