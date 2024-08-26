//importing controllers
const { register, login, create_group, get_user, add_user, remove_user, 
    update_group, get_groups, get_members, check_admin, delete_group, 
    forgot_password, reset_password, reset_new_password } = require('../controllers/user_controller')

//importing middleware
const { verify_user } = require('../middlewares/user_auth')

module.exports = function(app){
    app.post('/user/register', verify_user, register),
    app.post('/user/login', login),
    app.post('/create-group', create_group),
    app.get('/get-groups', get_groups),
    app.get('/get-members', get_members),
    app.get('/get-user', get_user),
    app.post('/add-user', add_user),
    app.get('/check-admin', check_admin),
    app.delete('/remove-user', remove_user),
    app.delete('/delete-group', delete_group),
    app.put('/update-group', update_group),
    app.post('/password/forgot-password',forgot_password),
    app.get('/password/reset-password/:uuid',reset_password),
    app.post('/password/reset-new-password',reset_new_password)
}