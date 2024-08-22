const user_model = require('../models/user_model')
const { Op } = require('sequelize')

function verify_user(req,res,next){
    let user_details = req.body

    //checking with db if the user exists
    user_model.findAll({ where: {
        [Op.or]: [
            { email: user_details.email },
            { phone: user_details.phone }
          ]
    }}).then(db_res=>{
        if(db_res.length==0){
            next()
        }else{
            res.status(403).send(JSON.stringify({ message: "Email/Phone Already exists" }))
        }
    }).catch(err=>{
        console.log(err)
        res.status(500).send(JSON.stringify({ error: err }))
    })
}

module.exports = { verify_user }