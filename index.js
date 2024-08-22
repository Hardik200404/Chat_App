const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')
const user_model = require('./models/user_model')
const chat_model = require('./models/chat_model')

const app = express()

app.use(cors())
app.use(express.json())

require('./routes/user_routes')(app)
require('./routes/chat_routes')(app)

user_model.hasMany(chat_model)
chat_model.belongsTo(user_model)

let PORT = process.env.PORT || 3000

sequelize.sync()
.then(result => {
    app.listen(PORT)
    console.log("Synced with DB and app runing on port: ",PORT)
}).catch(err => console.log(err))