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

async function get_groups_service(userId){
    let db_res
    try{
        await sequelize.transaction(async(t)=>{
            db_res = await user_model.findByPk(userId, {
                include: {
                    model: group_model,
                    through: { attributes: [] }
                }
            })
        })
        return db_res.dataValues.groups
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function get_members_service(groupId){
    let db_res
    try{
        await sequelize.transaction(async(t)=>{
            db_res = await group_model.findByPk(groupId, {
                include: {
                    model: user_model,
                    through: { attributes: [] }
                }
            })
        })
        return db_res.dataValues.users
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function get_user_service(query){
    let user
    try{
        if(query.email){
            user = await user_model.findOne({ where: { email: query.email }})
        }else{
            const phone = '+' + query.phone.trim()
            user = await user_model.findOne({ where: { phone: phone }})
        }
        return user.dataValues
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function add_user_service(groupId, userId){
    groupId = +groupId
    try{
        await sequelize.transaction(async(t)=>{
            const group = await group_model.findByPk(groupId, { transaction: t })

            await group.addUser(userId, { transaction: t })
        })
        return { message: 'User Added To Group Successfully' }
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

module.exports = { register_service, login_service, add_user_service, 
    create_group_service, get_groups_service, get_members_service, get_user_service }