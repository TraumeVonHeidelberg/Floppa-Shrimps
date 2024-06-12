const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = MenuItem;
