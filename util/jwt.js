const jwt = require('jsonwebtoken')
require('dotenv').config()

function generate_jwt_token(payload){
    let token=jwt.sign(payload,process.env.jwt_secret)
    return token
}

function verify_jwt_token(token){
    let decoded_id = jwt.verify(token,process.env.jwt_secret)
    return decoded_id
}

module.exports = { generate_jwt_token, verify_jwt_token }