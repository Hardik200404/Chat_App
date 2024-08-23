const { register_service, login_service, 
    create_group_service, get_groups_service } = require('../services/user_service')
const { generate_jwt_token, verify_jwt_token } = require('../util/jwt')
const bcrypt = require('bcrypt')

async function register(req,res){
    req.body.password = bcrypt.hashSync(req.body.password,8)
    
    let response = await register_service(req.body)
    if(response.error){
        res.status(500).send(JSON.stringify(response.error))
    }else{
        res.status(201).send(JSON.stringify(response.message))
    }
}

async function login(req,res){
    let db_res = await login_service(req.body)
    if(db_res){
        //user found
        if(bcrypt.compareSync(req.body.password, db_res.dataValues.password)){
            //checking password
            let token = generate_jwt_token(db_res.dataValues.id)
            res.status(200).send(JSON.stringify({ message: "Logged In Successfullly", token: token }))
        }else if(db_res.error){
            res.status(500).send(JSON.stringify(db_res.error))
        }
        else{
            res.status(401).send(JSON.stringify({ error: "Bad Credentials" }))
        }
    }else{
        res.status(404).send(JSON.stringify({ error: "User Not Found" }))
    }
}

async function create_group(req,res){
    req.body.admin = verify_jwt_token(req.body.admin)

    const response = await create_group_service(req.body)

    if(response.error){
        res.status(500).send(JSON.stringify(response.error))
    }else{
        res.status(201).send(JSON.stringify(response))
    }
}

async function get_groups(req,res){
    const response = await get_groups_service()

    if(response){
        if(response.error){
            res.status(500).send(JSON.stringify(response.error))
        }else{
            res.status(200).send(JSON.stringify(response))
        }
    }else{
        res.status(404).send(JSON.stringify({ error: "Groups Not Found" }))
    }
}

module.exports = { register, login, create_group, get_groups }