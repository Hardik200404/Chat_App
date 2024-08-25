const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')
const user_model = require('./models/user_model')
const chat_model = require('./models/chat_model')
const group_model = require('./models/group_model')

const app = express()

app.use(cors())
app.use(express.json())

require('./routes/user_routes')(app)
require('./routes/chat_routes')(app)

user_model.hasMany(chat_model)
chat_model.belongsTo(user_model)

group_model.hasMany(chat_model,{ onDelete: 'CASCADE' }) 
// If the group is removed, chats should be removed
chat_model.belongsTo(group_model)

// Defining many to many relation which the user and group will have
user_model.belongsToMany(group_model,{
    through:'users_and_groups',
    foreignKey:'user_id',
    otherKey:'group_id'
})
group_model.belongsToMany(user_model,{
    through:'users_and_groups',
    foreignKey:'group_id',
    otherKey:'user_id'
})

let PORT = process.env.PORT || 3000

sequelize.sync()
.then(result => {
    app.listen(PORT)
    console.log("Synced with DB and app runing on port: ",PORT)
}).catch(err => console.log(err))