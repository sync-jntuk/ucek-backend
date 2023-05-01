import express from "express"
import config from "config"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import newsFeed from "./routes/newsFeed.js"
import student from "./routes/student.js"
import regulation from "./routes/regulation.js"
import notification from "./routes/notification.js"
import admin from "./routes/admin.js"
import payment from "./routes/payment.js"
import fileUpload from "./routes/upload.js"


dotenv.config()
const app = express()
const PORT = process.env.PORT || config.get('server.port')
const HOST = process.env.HOST || config.get('server.host')
const MONGO = process.env.MONGO || config.get('mongo.url')
app.use(cors({
    origin: "*"
}))
app.use(express.json())
app.set('view engine', 'ejs')


let count = 0

app.get('/', async (req, res) => {
    res.status(200).json({"message": `server is working [ count: ${++count} ]`})
})

app.use('/student', student)
app.use('/newsfeed', newsFeed)
app.use('/regulation', regulation)
app.use('/notification', notification)
app.use('/admin', admin)
app.use('/payment', payment)
app.use('/upload', fileUpload)

mongoose.connect(MONGO)
    .then(() => {
        console.log("DB Connected")
        app.listen(PORT, () => console.log(`open http://${HOST}:${PORT}`))
    })
    .catch(() => console.log("db NOT connected"))
