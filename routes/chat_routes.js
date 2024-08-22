const { get_message, post_message } = require('../controllers/chat_contoller')

module.exports = function(app){
    app.get('/get-message', get_message),
    app.post('/post-message', post_message)
}