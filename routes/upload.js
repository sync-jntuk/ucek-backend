import express from "express"
// import s3Uploadv2 from "../utility_modules/fileHandler.js"
import dotenv from "dotenv"
import StudentController from "../controllers/student.js"
import multer from "multer"
import { initializeApp } from "firebase/app"
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"


const studentController = StudentController()

dotenv.config()
const app = express.Router()

const firebaseConfig = {
    apiKey: process.env.FIRE_BASE_API_KEY,
    authDomain: process.env.FIRE_BASE_AUTH_DOMAIN,
    projectId: process.env.FIRE_BASE_PROJECT_ID,
    storageBucket: process.env.FIRE_BASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIRE_BASE_MESSAGE_SENDER,
    appId: process.env.FIRE_BASE_APP_ID,
    measurementId: process.env.FIRE_BASE_MEASUREMENT_ID
}

initializeApp(firebaseConfig)
const firebaseStorage = getStorage()
const storage = multer.memoryStorage()
const uploadStorage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

app.route('/exam-fee-receipt')
    .post(uploadStorage.array('file_to_upload'), async (req, res) => {
        try {
            const { challana } = req.body
            const metedata = { contentType: req.file.mimetype }
            const storageRef = ref(firebaseStorage, `uploads/${challana}-exam-fee-receipt`, metedata)
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer)
            const downloadURL = await getDownloadURL(snapshot.ref)
            res.status(200).json({ status: "success", result: downloadURL })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/revaluation-receipt')
    .post(uploadStorage.array('file_to_upload'), async (req, res) => {
        try {
            const { DU_number } = req.body
            const metedata = { contentType: req.file.mimetype }
            const storageRef = ref(firebaseStorage, `uploads/${DU_number}-revaluation-receipt`, metedata)
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer)
            const downloadURL = await getDownloadURL(snapshot.ref)
            res.status(200).json({ status: "success", result: downloadURL })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/certificate-receipt')
    .post(uploadStorage.single('file_to_upload'), async (req, res) => {
        try {
            const { DU_number } = req.body
            const metedata = { contentType: req.file.mimetype }
            const storageRef = ref(firebaseStorage, `uploads/${DU_number}-certificate-receipt`, metedata)
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer)
            const downloadURL = await getDownloadURL(snapshot.ref)
            res.status(200).json({ status: "success", result: downloadURL })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/profile-picture')
    .post(uploadStorage.single('file_to_upload'), async (req, res) => {
        try {
            const { roll } = req.body
            const metedata = { contentType: req.file.mimetype }
            const storageRef = ref(firebaseStorage, `uploads/${roll}-profile-picture`, metedata)
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer)
            const downloadURL = await getDownloadURL(snapshot.ref)
            await studentController.updateProfile({ roll: roll, picture: downloadURL }, { new: true })
            res.status(200).json({ status: "success", result: downloadURL })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })


const fileUpload = app
export default fileUpload
