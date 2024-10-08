const { get_message_service, post_message_service } = require('../services/chat_service')
const get_date_time = require('../util/date_time_now')
const { verify_jwt_token } = require('../util/jwt')

async function get_message(req,res){
    const result = await get_message_service(req.query)

    if(result){
        res.status(200).send(JSON.stringify(result))
    }else{
        res.status(500).send(JSON.stringify(result.error))
    }
}

async function post_message(req,res){
    const userId = verify_jwt_token(req.headers.authorization)
    const date_time = get_date_time()

    const data_to_insert = {
        message: req.body.message,
        username: null,
        created_at: date_time,
        userId: userId,
        groupId: req.body.groupId
    }
    // console.log(data_to_insert)
    
    const result = await post_message_service(data_to_insert)
    if(result){
        res.status(201).send(JSON.stringify(result))
    }else{
        res.status(500).send(JSON.stringify(result.error))
    }
}

module.exports = { get_message, post_message }