import express from "express"
import s3Uploadv2 from "../utility_modules/fileHandler.js"
import dotenv from "dotenv"
import StudentController from "../controllers/student.js"
import multer from "multer"

const studentController = StudentController()

dotenv.config()
const app = express.Router()

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
            const result = await s3Uploadv2(req.files, [`${challana}-exam-fee-receipt`])
            res.status(200).json({ status: "success", result })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/revaluation-receipt')
    .post(uploadStorage.array('file_to_upload'), async (req, res) => {
        try {
            const { DU_number } = req.body
            const result = await s3Uploadv2(req.files, [`${DU_number}-revaluation-receipt`])
            res.status(200).json({ status: "success", result })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/certificate-receipt')
    .post(uploadStorage.array('file_to_upload'), async (req, res) => {
        try {
            const { DU_number } = req.body
            const result = await s3Uploadv2(req.files, [`${DU_number}-certificate-receipt`])
            res.status(200).json({ status: "success", result })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

app.route('/profile-picture')
    .post(uploadStorage.array('file_to_upload'), async (req, res) => {
        try {
            const { roll } = req.body
            const result = await s3Uploadv2(req.files, [`${roll}-profile-picture`])
            await studentController.updateProfile({ roll: roll, picture: result[0].Location })
            res.status(200).json({ status: "success", result })
        } catch (err) {
            res.status(200).json({ errno: 500 })
        }
    })

const fileUpload = app
export default fileUpload
