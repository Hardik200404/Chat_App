const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const chat_model = sequelize.define('chats',{
    message:{
        type: Sequelize.STRING,
        allowNull: false
    },
    username:{
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at:{
        type: Sequelize.STRING,
        allowNull: false
    }
},{timestamps: false})

module.exports = chat_model