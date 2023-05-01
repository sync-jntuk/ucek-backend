import student from "../models/student.js"
import regulation from "../models/regulation.js"
import examResult from "../models/examResult.js"
import semesterApplicaion from "../models/semesterApplication.js"
import certificateApplication from "../models/cerificationAppliction.js"
import revalutionApplication from "../models/revalutionApplication.js"
import metaData from "../models/metaData.js"
import sendMail from "../utility_modules/mailHandler.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

export default function StudentController() {
    return {
        getStreak: async function ({ roll }) {
            const meta_data = await metaData.find({}, { _id: 0 })
            const user_data = await student.findOne({ roll: roll }, {
                _id: 0,
                logins: 1,
                queries: 1
            })
            return {
                ...JSON.parse(JSON.stringify(user_data)),
                global: JSON.parse(JSON.stringify(meta_data))
            }
        },
        login: async function ({ roll, passwd }) {
            try {
                const result = await student.findOneAndUpdate({ roll: roll, passwd: passwd }, {
                    $inc: { 'logins.total': 1 }
                })
                await metaData.updateOne({ key: 'total_login_count' }, { $inc: { value: 1 } })
                delete result.passwd
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        forgotPassword: async function ({ roll }) {
            try {
                const passwd = uuidv4().split('-')[0]
                console.log(passwd)
                const result = await student.findOneAndUpdate({ roll: roll }, { passwd: passwd })
                console.log(result)
                if (!result) {
                    return { errno: 404, ...e }
                }
                await sendMail({ receiverMail: result.email, static_msg: 'forgot_password', details: { name: result.first_name, passwd: passwd } })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        register: async function ({ roll, first_name, last_name, email, phone, passwd, regulation, batch, graduation_type, father_name }) {
            try {
                const join_year = {
                    'Btech': 4,
                    'Mtech': 2,
                }
                const data = {
                    roll: roll,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone,
                    graduation_type: graduation_type,
                    father_name: father_name,
                    passwd: passwd,
                    regulation: regulation,
                    batch: batch - join_year[graduation_type],
                }
                await student.validate(data)
                if (await student.findOne({ roll: roll })) {
                    throw new Error("duplicate roll number")
                }
                if (await student.findOne({ email: email })) {
                    throw new Error("duplicate email address")
                }
                const token = jwt.sign({ data: data }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' })
                await sendMail({ receiverMail: email, static_msg: 'register', details: { name: first_name, token: token } })
                return { message: "emailsent" }
            } catch (e) {
                return { errno: 403, ...e }
            }
        },
        emailVerification: async function ({ token }) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
                const new_student = new student(decoded.data)
                const result = await new_student.save()
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        updateProfile: async function ({ roll, first_name, last_name, email, picture }) {
            let update = {}
            if (email) {
                update.email = email
            }
            if (first_name) {
                update.first_name = first_name
                update.last_name = last_name
            }
            if (picture) {
                update.picture = picture
            }
            try {
                let result = await student.findOneAndUpdate({ roll: roll }, {
                    $set: {
                        ...update
                    }
                })
                result = {
                    ...result,
                    ...update
                }
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        uploadExamRecipt: async function ({ challana, receipt }) {
            try {
                const result = await semesterApplicaion.updateOne({ challana: challana }, {
                    receipt: receipt
                })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        updatePasswd: async function ({ roll, passwd, npasswd }) {
            try {
                const result = await student.updateOne({ roll: roll, passwd: passwd }, { passwd: npasswd })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getResult: async function ({ roll, regulation_, year, semester }) {
            try {
                let regulation_subjects = await regulation.findOne({
                    regulation: regulation_,
                    year: year,
                    semester: semester
                })
                let marks = await examResult.findOne({
                    roll: roll,
                    year: year,
                    semester: semester
                })
                let result = JSON.parse(JSON.stringify(regulation_subjects))
                result.roll = roll
                let cumReg = 0, cumSum = 0
                for (const [k, v] of Object.entries(marks.subjects)) {
                    result.subjects[k].grade = v
                    if (v == 0 || result.subjects[k].credits < 0)
                        continue
                    cumReg += result.subjects[k] ? result.subjects[k].credits : 3
                    cumSum += v * (result.subjects[k] ? result.subjects[k].credits : 3)
                }
                result.creditSum = cumReg
                result.total = (cumSum / cumReg).toFixed(2)
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        applyForSemester: async function ({ roll, year, semester, batch, regulation_, exam_type, challana, subjects, receipt }) {
            try {
                const application = new semesterApplicaion({
                    roll: roll,
                    year: year,
                    semester: semester,
                    batch: batch,
                    regulation: regulation_,
                    exam_type: exam_type,
                    challana: challana,
                    subjects: subjects,
                    receipt: receipt
                })
                const result = await application.save()
                return result
            } catch (e) {
                return { errno: 403, ...e }
            }
        },
        applyForRevaluation: async function ({ roll, year, semester, batch, regulation_, DU_number, subjects, receipt }) {
            try {
                const reval = new revalutionApplication({
                    roll: roll, year: year, semester: semester,
                    regulation: regulation_,
                    batch: batch,
                    DU_number: DU_number, subjects: subjects,
                    receipt: receipt
                })
                const result = await reval.save()
                return result
            } catch (e) {
                return { errno: 403, ...e }
            }
        },
        applyForCertificates: async function ({ roll, email, application_type, name, purpose, DU_number, date_of_payment, receipt }) {
            try {
                const certificate = new certificateApplication({
                    roll: roll,
                    email: email,
                    application_type: application_type,
                    name: name,
                    purpose: purpose,
                    DU_number: DU_number,
                    date_of_payment: date_of_payment,
                    receipt: receipt
                })
                const result = await certificate.save()
                return result
            } catch (e) {
                return { errno: 403, ...e }
            }
        },
        getCertificateStatus: async function ({ roll }) {
            try {
                const result = await certificateApplication.find({ roll: roll })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getHallticket: async function ({ roll, exam_type }) {
            try {
                const result = await semesterApplicaion.aggregate([
                    {
                        $match: {
                            roll: roll,
                            checked: true,
                            exam_type: exam_type
                        }
                    },
                    {
                        $sort: {
                            year: 1, semester: 1
                        }
                    }
                ])
                return result[result.length - 1]
            } catch (e) {
                return { errno: 404, ...e }
            }
        }
    }
}
