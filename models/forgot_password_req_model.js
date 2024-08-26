const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const forgot_password_req_model = sequelize.define('forgot_password_req',{
    id:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    is_active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
})

module.exports = forgot_password_req_model