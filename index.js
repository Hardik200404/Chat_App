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

const multer = require('multer')
const AWS = require('aws-sdk')
const fs = require('fs')
const { verify_jwt_token } = require('./util/jwt')
const get_date_time = require('./util/date_time_now')
const { post_message_service } = require('./services/chat_service')
require('dotenv').config()

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }) // Temporarily save files to 'uploads/' folder

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
})

app.post('/upload-file', upload.single('file'), (req, res) => {
    const userId = verify_jwt_token(req.headers.authorization)
    const file = req.file
    if (!file) {
        return res.status(400).send({ error : 'No file uploaded.'})
    }

    // Upload to S3
    const fileStream = fs.createReadStream(file.path)
    const uploadParams = {
        Bucket: process.env.BUCKET,
        Body: fileStream,
        Key: file.originalname // or a unique key for each file
    }

    s3.upload(uploadParams, async (err, data) => {
        if (err) {
            console.error('Error uploading file:', err)
            return res.status(500).send('Error uploading file.')
        }

        // Remove the file from local storage after upload
        fs.unlinkSync(file.path)

        const date_time = get_date_time()

        const data_to_insert = {
            message: data.Location,
            username: null,
            created_at: date_time,
            userId: userId,
            groupId: req.query.groupId
        }

        // Store the url in db
        const result = await post_message_service(data_to_insert)
        if(result){
            res.status(201).send(JSON.stringify(result))
        }else{
            res.status(500).send(JSON.stringify(result.error))
        }
    })
})

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

// Running the cronjob to delete messages every minute
const cron = require('node-cron')

cron.schedule('0 0 * * *', ()=>{
    console.log('Running chat cleanup job...')
    try{
        sequelize.transaction(async(t)=>{
            await chat_model.truncate()
        })
    }catch(err){
        console.log('Error Deleting Chats', err)
    }
})