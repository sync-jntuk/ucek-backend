import admin from "../models/admin.js"
import examResult from "../models/examResult.js"
import student from "../models/student.js"
import metaData from "../models/metaData.js"
import semesterApplication from "../models/semesterApplication.js"
import certificateApplication from "../models/cerificationAppliction.js"
import revalutionApplication from "../models/revalutionApplication.js"
import sendMail from "../utility_modules/mailHandler.js"
import StudentController from "./student.js"

const studentController = StudentController()

function getHTMLFormat(result) {
    if (!result) {
        throw "No result available"
    }
    result.subjects = Object.entries(result.subjects)
    let body = `
                <p>Roll Number: ${result.roll}</p>
                <p>Year: ${result.year}, Semester: ${result.semester}</p>
                <table>
                    <tr>
                        <th>COURSE CODE</th>
                        <th>COURSE TITLE</th>
                        <th>POINTS</th>
				    </tr>
            `
    for (const subject of result.subjects) {
        body += `
                    <tr>
                        <th>${subject[0]}</th>
                        <td>${subject[1].name}</td>
                        <th>${subject[1].grade}</th>
                    </tr>
                `
    }
    body += `
                </table>
                <p>GPA : ${result.total}</p>
                <p>Credits : ${result.creditSum}</p>
            `
    return body
}

export default function AdminController() {
    return {
        login: async function ({ email, passwd }) {
            try {
                const result = await admin.findOne({ email: email, passwd: passwd })
                delete result.passwd
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getStudentDetails: async function ({ roll }) {
            try {
                const result = await student.findOne({ roll: roll })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getStudentData: async function ({ batch, graduation_type }) {
            try {
                const result = await student.find({ batch: batch - 4, graduation_type: graduation_type })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        uploadResult: async function ({ roll, semester, year, subjects }) {
            let sub = {}
            for (const [k, v] of Object.entries(subjects)) {
                sub[k] = +v
            }
            try {
                const stud = await student.findOne({ roll: roll })
                const p_data = await examResult.findOne({ roll: roll, semester: semester, year: year })
                if (!p_data) {
                    const examRes = new examResult({
                        roll: roll,
                        semester: semester,
                        year: year,
                        subjects: sub,
                        batch: stud.batch
                    })
                    const result = await examRes.save()
                    return result
                } else {
                    const p_sub = JSON.parse(JSON.stringify(p_data.subjects))
                    const result = await examResult.updateOne({ roll: roll, semester: semester, year: year }, {
                        $set: {
                            subjects: {
                                ...p_sub,
                                ...sub
                            }
                        }
                    })
                    return result
                }
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        uploadSupplyResult: async function ({ roll, semester, year, subjects }) {
            let sub = {}
            for (const [k, v] of Object.entries(subjects)) {
                sub[k] = +v
            }
            try {
                const examRes = await examResult.findOne({ roll: roll, semester: semester, year: year })
                const result = await examResult.findOneAndUpdate({
                    roll: roll,
                    semester: semester,
                    year: year,
                }, {
                    $set: {
                        subjects: {
                            ...examRes.subjects,
                            ...sub
                        }
                    }
                })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        updateProfile: async function ({ email, passwd, npasswd }) {
            try {
                const result = await admin.updateOne({ email: email, passwd: passwd }, { passwd: npasswd })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        updateMetaData: async function ({ key, value }) {
            try {
                const result = await metaData.findOneAndUpdate({ key: key }, { value: value }, { new: true })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getSemesterApplications: async function ({ exam_type }) {
            try {
                const results = await semesterApplication.find({
                    exam_type: exam_type,
                    checked: false
                })
                return results
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        approveSemesterApplication: async function ({ roll, exam_type, challana }) {
            try {
                const results = await semesterApplication.findOneAndUpdate({
                    roll: roll,
                    exam_type: exam_type,
                    challana: challana
                }, { $set: { checked: true } })
                const stud = await student.findOne({ roll: roll })
                await sendMail({
                    receiverMail: stud.email,
                    static_msg: 'approve_result_application',
                    details: {
                        name: stud.first_name,
                        roll: stud.roll,
                        year: results.year,
                        semester: results.semester,
                        challana: challana
                    }
                })
                return results
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getRevaluationCertificates: async function () {
            try {
                const result = await revalutionApplication.find({ checked: false })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        approveRevaluationCertificate: async function ({ roll, DU_number }) {
            try {
                const result = await revalutionApplication.updateOne({ roll: roll, DU_number: DU_number }, {
                    $set: {
                        checked: true
                    }
                })
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        getCertificates: async function ({ approved }) {
            try {
                const results = await certificateApplication.find({
                    approved: false
                })
                return results
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        approveCertifate: async function ({ roll, DU_number, application_type }) {
            const results = await certificateApplication.findOneAndUpdate({
                roll: roll,
                DU_number: DU_number
            }, { $set: { approved: true } })
            const stud = await student.findOne({ roll: roll })
            await sendMail({
                receiverMail: stud.email,
                static_msg: 'approve_applications',
                details: {
                    name: stud.first_name,
                    roll: stud.roll,
                    application_type: application_type
                }
            })
            return results
        },
        sendResult: async function ({ roll, regulation_, year, semester }) {
            try {
                const stud = await student.findOne({ roll: roll })
                let result = await studentController.getResult({
                    roll: roll,
                    regulation_: regulation_,
                    year: year,
                    semester: semester
                })
                let body = getHTMLFormat(result)
                let status = await sendMail({ receiverMail: stud.email, mailBody: body })
                return status
            } catch (e) {
                return { errno: 404, ...e }
            }
        },
        sendAllResults: async function ({ batch, year, semester }) {
            const studs = await student.find({ batch: batch })
            for (const stud of studs) {
                try {
                    await this.sendResult({
                        roll: stud.roll,
                        regulation_: stud.regulation,
                        year: year,
                        semester: semester
                    })
                } catch (e) { }
            }
            return { message: "mails sent" }
        },
        getMetaData: async function () {
            try {
                const result = await metaData.find()
                return result
            } catch (e) {
                return { errno: 404, ...e }
            }
        }
    }
}

