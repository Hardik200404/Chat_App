const chat_model = require('../models/chat_model')
const user_model = require('../models/user_model')
const sequelize = require('../util/database')

async function get_message_service(){
    let result
    try{
        // Start a transaction
        await sequelize.transaction(async(t)=>{
            // Get the messages
            result = await chat_model.findAll({ transaction: t })
        })
        return result
    }catch(err){
        console.log(err)
        return {error: err} 
    }
}

async function post_message_service(message){
    let result
    try{
        // Start a transaction
        await sequelize.transaction(async(t)=>{
            // Get the user
            const user = await user_model.findByPk(message.userId)
            message.username = user.dataValues.username

            // Add message
            result = await chat_model.create(message, { transaction: t })
        })
        return result
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

module.exports = { get_message_service, post_message_service }