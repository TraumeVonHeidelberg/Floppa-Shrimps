const sequelize = require('../config/database');
const Table = require('../models/table');

const seedTables = async () => {
    await sequelize.sync({ force: true }); // Używamy force: true, aby wyczyścić istniejące dane

    const tables = [
        { name: 'Table 1', seats: 4 },
        { name: 'Table 2', seats: 6 },
        { name: 'Table 3', seats: 2 },
        { name: 'Table 4', seats: 8 },
        { name: 'Table 5', seats: 4 },
        { name: 'Table 6', seats: 6 },
        { name: 'Table 7', seats: 2 },
        { name: 'Table 8', seats: 8 },
    ];

    try {
        for (const table of tables) {
            await Table.create(table);
        }
        console.log('Tables have been seeded');
    } catch (err) {
        console.error('Error seeding tables:', err);
    } finally {
        await sequelize.close();
    }
};

seedTables();
