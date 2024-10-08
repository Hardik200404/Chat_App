const user_model = require('../models/user_model')
const group_model = require('../models/group_model')
const forgot_password_req_model = require('../models/forgot_password_req_model')
const sequelize = require('../util/database')

const Sib = require('sib-api-v3-sdk')
const { v4: uuidv4 } = require('uuid')

require('dotenv').config()

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
        return db_res == null ? [] : db_res.dataValues.groups
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
    let user_in_group
    try{
        await sequelize.transaction(async(t)=>{
            const group = await group_model.findByPk(groupId, { transaction: t })

            user_in_group = await group.hasUser(userId, { transaction: t })
            if(!user_in_group){
                // Not a member
                await group.addUser(userId, { transaction: t })
            }
        })

        return { is_member: user_in_group }
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function check_admin_service(groupId){
    try{
        const group = await group_model.findByPk(groupId)
        return group.dataValues
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function remove_user_service(groupId, userId){
    groupId = +groupId
    userId = +userId

    try{
        await sequelize.transaction(async(t)=>{
            const group = await group_model.findByPk(groupId, { transaction: t })

            await group.removeUser(userId, { transaction: t })
        })
        return { message: 'User Removed Successfully' }
    }catch(err){
        console.log(err)
        return { error: err }
    }
}

async function delete_group_service(groupId){
    try{
        // Delete the group
        await group_model.destroy({ where: { id: groupId }})
        return { message: 'Group Removed Successfully' }
    }catch(err){
        console.error(err)
        return { error: err }
    }
}

async function update_group_service(groupId, data_to_insert){
    groupId = +groupId
    try{
        await sequelize.transaction(async(t)=>{
            await group_model.update({
                    name: data_to_insert.group_name,
                    desc: data_to_insert.group_desc
                },
                {where: { id: groupId }, transaction: t}
            )
        })
        return { message: 'Group Updated Successfully' }
    }catch(err){
        console.error(err)
        return { error: err }
    }
}

async function forgot_password_service(email){
    
    //generate uuid for forgot password req
    let uuid = uuidv4()

    //configure email
    const client = Sib.ApiClient.instance
    const api_key_obj = client.authentications['api-key']
    api_key_obj.apiKey = process.env.SIB_API_KEY
    
    const sender = {
        email: process.env.EMAIL,
        name: 'Hardik'
    }
    const receivers = [
        {
            email: email
        }
    ]

    //using the email , find the user, get their userId, then 
    //store the record in forgot_password_req in db
    try{
        //start a transaction
        await sequelize.transaction(async(t)=>{
            let user = await user_model.findOne({where:{
                email: email
            }})
            forgot_password_req_model.create({
                id: uuid,
                userId: user.dataValues.id,
            })
        })  

        const email_api = new Sib.TransactionalEmailsApi()
        await email_api.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Password',
            htmlContent: `<a href='http://localhost:3000/password/reset-password/${uuid}'>Click Here To Reset Password</a>`
        })
        return {message: 'Email Sent'}
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

async function reset_password_service(uuid){
    //check with forgot_password_req if the uuid exists or not
    try{
        let record = await forgot_password_req_model.findByPk(uuid)
        return record
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

async function reset_new_password_service(new_password, userId){
    try{
        await sequelize.transaction(async(t) => {
            await user_model.update(
                {password: new_password},
                {where: {id: userId}, transaction: t}
            )
            await forgot_password_req_model.update(
                {is_active: false},
                {where: {userId: userId}, transaction: t}
            )
        })
        return {message: 'Password Updated Successfully'}
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

module.exports = { register_service, login_service, add_user_service, 
    create_group_service, get_groups_service, remove_user_service, update_group_service,
    get_members_service, get_user_service, check_admin_service, delete_group_service,
    forgot_password_service, reset_password_service, reset_new_password_service
}