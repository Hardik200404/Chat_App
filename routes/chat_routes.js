const { post_message } = require('../controllers/chat_contoller')

module.exports = function(app){
    app.post('/post-message', post_message)
}