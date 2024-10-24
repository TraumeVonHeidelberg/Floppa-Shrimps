//sequelize to biblioteka node.js ktora pozwala na łatwe zarzadzanie bazą danych z poziomu javascript
const { Sequelize } = require('sequelize')
const path = require('path')  //praca ze ścieżkami plików

//tworzenie połączenia z bazą danych sqlite
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, '../database.sqlite'),
	logging: console.log, // Dodaje logowanie zapytań SQL
})

// Asynchroniczna funkcja do tworzenia triggerów w bazie danych
// Triggery są używane do automatycznego aktualizowania pól 'updatedAt'
// po aktualizacji rekordu w tabelach lub usunięciu rekordu z tabeli 'Users'
async function createTriggers() {
	// Lista tabel, dla których tworzymy trigger
	const tables = [
		'Users', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'Users'
		'Reservations', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'Reservations'
		'Tables', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'Tables'
		'News', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'News'
		'NewsHeaderTexts', // Usuwanie rekordów z tabeli 'Comments' po usunięciu rekordu z tabeli 'News'
		'Comments', // Usuwanie rekordów z tabeli 'Comments' po usunięciu rekordu z tabeli 'Users'
		'MenuItems', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'MenuItems'
		'Testimonials', // Aktualizacja pola 'updatedAt' po aktualizacji rekordu w tabeli 'Testimonials'
	]

	// Tworzenie triggerów dla każdej tabeli
	for (const table of tables) {
		// Tworzenie triggera po aktualizacji rekordu w tabeli
		await sequelize.query(`
            -- Tworzenie triggera po aktualizacji rekordu w tabeli ${table}
            CREATE TRIGGER IF NOT EXISTS update_${table.toLowerCase()}_timestamp
            AFTER UPDATE ON ${table}
            -- Dla każdego rekordu w tabeli
            FOR EACH ROW
            -- Aktualizacja pola 'updatedAt' rekordu o ID równym ID poprzedniego rekordu
            BEGIN
                UPDATE ${table} SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
            END;
        `)
	}

	// Tworzenie triggera po usunięciu rekordu z tabeli 'Users'
	await sequelize.query(`
        -- Tworzenie triggera po usunięciu rekordu z tabeli Users
        CREATE TRIGGER IF NOT EXISTS delete_user_comments
        AFTER DELETE ON Users
        -- Dla każdego usuniętego rekordu z tabeli Users
        FOR EACH ROW
        -- Usuwanie rekordów z tabeli Comments, gdzie 'userId' jest równy ID usuniętego rekordu z tabeli Users
        BEGIN
            DELETE FROM Comments WHERE userId = OLD.id;
        END;
    `)

	// Tworzenie triggera po usunięciu rekordu z tabeli 'News'
	await sequelize.query(`
        -- Tworzenie triggera po usunięciu rekordu z tabeli News
        CREATE TRIGGER IF NOT EXISTS delete_news_headers
        AFTER DELETE ON News
        -- Dla każdego usuniętego rekordu z tabeli News
        FOR EACH ROW
        -- Usuwanie rekordów z tabeli NewsHeaderTexts, gdzie 'newsId' jest równy ID usuniętego rekordu z tabeli News
        BEGIN
            DELETE FROM NewsHeaderTexts WHERE newsId = OLD.id;
        END;
    `)

	// Tworzenie triggera po usunięciu rekordu z tabeli 'Users'
	await sequelize.query(`
        -- Tworzenie triggera po usunięciu rekordu z tabeli Users
        CREATE TRIGGER IF NOT EXISTS delete_user_reservations
        AFTER DELETE ON Users
        -- Dla każdego usuniętego rekordu z tabeli Users
        FOR EACH ROW
        -- Usuwanie rekordów z tabeli Reservations, gdzie 'userId' jest równy ID usuniętego rekordu z tabeli Users
        BEGIN
            DELETE FROM Reservations WHERE userId = OLD.id;
        END;
    `)

	// Tworzenie triggera po aktualizacji rekordu w tabeli 'Comments'
	await sequelize.query(`
        -- Tworzenie triggera po aktualizacji rekordu w tabeli Comments
        CREATE TRIGGER IF NOT EXISTS update_news_timestamp_on_comment
        AFTER UPDATE ON Comments
        -- Dla każdego aktualizowanego rekordu w tabeli Comments
        FOR EACH ROW
        -- Aktualizacja pola 'updatedAt' rekordu w tabeli News, gdzie 'id' jest równy 'newsId' aktualizowanego rekordu w tabeli Comments
        BEGIN
            UPDATE News SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.newsId;
        END;
    `)

	// Tworzenie triggera po usunięciu rekordu z tabeli 'News'
	await sequelize.query(`
        -- Tworzenie triggera po usunięciu rekordu z tabeli News
        CREATE TRIGGER IF NOT EXISTS delete_news_comments
        AFTER DELETE ON News
        -- Dla każdego usuniętego rekordu z tabeli News
        FOR EACH ROW
        -- Usuwanie rekordów z tabeli Comments, gdzie 'newsId' jest równy ID usuniętego rekordu z tabeli News
        BEGIN
            DELETE FROM Comments WHERE newsId = OLD.id;
        END;
    `)
}

module.exports = { sequelize, createTriggers }
