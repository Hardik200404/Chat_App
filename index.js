const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const WebSocket = require('ws')
const sequelize = require('./util/database')
const user_model = require('./models/user_model')
const chat_model = require('./models/chat_model')
const group_model = require('./models/group_model')
const forgot_password_req_model = require('./models/forgot_password_req_model')

const app = express()

// Middleware
app.use(express.static(path.join(__dirname, 'views')))
app.use(cors())
app.use(express.json())
app.use(express.static('views/user_views'))

// Create HTTP server
const server = http.createServer(app)

// Set up WebSocket server
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws)=>{
    console.log('A user connected')

    ws.on('message', ()=>{
        // Broadcast to all connected clients
        wss.clients.forEach(client=>{
            if (client !== ws && client.readyState === WebSocket.OPEN){
                client.send('A user has sent some message')
            }
        })
    })

    ws.on('close', ()=>{
        console.log('User disconnected')
    })
})

// Define routes
require('./routes/user_routes')(app)
require('./routes/chat_routes')(app)

// Define Sequelize relationships
user_model.hasMany(chat_model)
chat_model.belongsTo(user_model)

group_model.hasMany(chat_model, { onDelete: 'CASCADE' })
chat_model.belongsTo(group_model)

user_model.belongsToMany(group_model, {
    through: 'users_and_groups',
    foreignKey: 'user_id',
    otherKey: 'group_id'
})
group_model.belongsToMany(user_model, {
    through: 'users_and_groups',
    foreignKey: 'group_id',
    otherKey: 'user_id'
})

user_model.hasMany(forgot_password_req_model)
forgot_password_req_model.belongsTo(user_model)

// Serve static HTML file for landing page
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'views/user_views', 'index.html'))
})

const PORT = process.env.PORT || 3000

// Sync database and start server
sequelize.sync()
.then(()=>{
    server.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch(err => console.log(err))