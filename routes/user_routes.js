//importing controllers
const { register, login, create_group, get_groups } = require('../controllers/user_controller')

//importing middleware
const { verify_user } = require('../middlewares/user_auth')

module.exports = function(app){
    app.post('/user/register', verify_user, register),
    app.post('/user/login', login),
    app.post('/create-group', create_group),
    app.get('/get-groups', get_groups)
}