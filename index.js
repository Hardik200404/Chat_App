const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')

const app = express()

app.use(cors())
app.use(express.json())

require('./routes/user_routes')(app)

let PORT = process.env.PORT || 3000

sequelize.sync()
.then(result => {
    app.listen(PORT)
    console.log("Synced with DB and app runing on port: ",PORT)
}).catch(err => console.log(err))