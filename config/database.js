const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, '../database.sqlite'),
	logging: console.log, // Dodaje logowanie zapytań SQL
})

// Funkcja do tworzenia triggerów
async function createTriggers() {
	const tables = ['Users', 'Reservations', 'Tables', 'News', 'NewsHeaderTexts', 'Comments', 'MenuItems', 'Testimonials']

	for (const table of tables) {
		await sequelize.query(`
            CREATE TRIGGER IF NOT EXISTS update_${table.toLowerCase()}_timestamp
            AFTER UPDATE ON ${table}
            FOR EACH ROW
            BEGIN
                UPDATE ${table} SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
            END;
        `)
	}

	await sequelize.query(`
        CREATE TRIGGER IF NOT EXISTS delete_user_comments
        AFTER DELETE ON Users
        FOR EACH ROW
        BEGIN
            DELETE FROM Comments WHERE userId = OLD.id;
        END;
    `)

	await sequelize.query(`
        CREATE TRIGGER IF NOT EXISTS delete_news_headers
        AFTER DELETE ON News
        FOR EACH ROW
        BEGIN
            DELETE FROM NewsHeaderTexts WHERE newsId = OLD.id;
        END;
    `)

	await sequelize.query(`
        CREATE TRIGGER IF NOT EXISTS delete_user_reservations
        AFTER DELETE ON Users
        FOR EACH ROW
        BEGIN
            DELETE FROM Reservations WHERE userId = OLD.id;
        END;
    `)

	await sequelize.query(`
        CREATE TRIGGER IF NOT EXISTS update_news_timestamp_on_comment
        AFTER UPDATE ON Comments
        FOR EACH ROW
        BEGIN
            UPDATE News SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.newsId;
        END;
    `)

	await sequelize.query(`
        CREATE TRIGGER IF NOT EXISTS delete_news_comments
        AFTER DELETE ON News
        FOR EACH ROW
        BEGIN
            DELETE FROM Comments WHERE newsId = OLD.id;
        END;
    `)
}

module.exports =  sequelize
module.exports = createTriggers