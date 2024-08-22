const Sequelize = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(process.env.db_name, process.env.db_user, process.env.db_password,{
    host:process.env.db_host,
    dialect:'mysql',
    timezone: '+05:30', // Indian Standard Time (IST)
    dialectOptions: {
        timezone: 'local',
    },
})

module.exports = sequelize