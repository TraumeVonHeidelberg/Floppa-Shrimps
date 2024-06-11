// models/newsHeaderText.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsHeaderText = sequelize.define('NewsHeaderText', {
    header: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

module.exports = NewsHeaderText;
