const user_model = require('../models/user_model')
const sequelize = require('../util/database')

async function register_service(user){
    try{
        await sequelize.transaction(async(t) => {
            await user_model.create(user)
        })
        return {message: 'User Registered Successfully'}
    }catch(err){
        console.log(err)
        return {error:err}
    }
}

async function login_service(user){
    try{
        let db_res = await user_model.findOne({where: { email: user.email}})
        return db_res
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

module.exports = { register_service, login_service }