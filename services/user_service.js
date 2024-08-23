const user_model = require('../models/user_model')
const group_model = require('../models/group_model')
const sequelize = require('../util/database')

async function register_service(user){
    try{
        await sequelize.transaction(async(t)=>{
            await user_model.create(user)
        })
        return { message: 'User Registered Successfully' }
    }catch(err){
        console.log(err)
        return { error:err }
    }
}

async function login_service(user){
    try{
        let db_res = await user_model.findOne({ where: { email: user.email }})
        return db_res
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function create_group_service(group_details){
    let result
    try{
        await sequelize.transaction(async(t)=>{
            result = await group_model.create(group_details, { transaction: t })
        
            await result.addUser(group_details.admin, { transaction: t })
        })
        return result
    }catch(err){
        console.log(err)
        return { error:err }
    }
}

async function get_groups_service(){
    try{
        let db_res = await group_model.findAll()
        return db_res
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

module.exports = { register_service, login_service, 
    create_group_service, get_groups_service }