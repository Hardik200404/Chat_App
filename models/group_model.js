const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const group_model = sequelize.define('groups',{
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    admin:{
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = group_model