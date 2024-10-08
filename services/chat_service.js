const chat_model = require('../models/chat_model')
const user_model = require('../models/user_model')
const sequelize = require('../util/database')

async function get_message_service(query){
    const groupId = query.groupId
    const page = query.page
    const limit = query.limit
    const offset = (page - 1) * limit

    let result
    try{
        // Start a transaction
        await sequelize.transaction(async(t)=>{
            // Get the messages
            result = await chat_model.findAndCountAll({
                    where: {'groupId': groupId},
                    order: [['id', 'DESC']], 
                    limit: +limit, 
                    offset: offset
                },
                { transaction: t }
            )
        })
        return { messages: result.rows, total_pages: Math.ceil(result.count / limit) }
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