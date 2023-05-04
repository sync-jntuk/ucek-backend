import dotenv from "dotenv"
import S3 from "aws-sdk/clients/s3.js"
dotenv.config()

export default async function s3Uploadv2(files, keys) {
    const s3 = new S3({
        // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
    const params = files.map((file, index) => {
        const ext = file.originalname.split('.').pop()
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'upload/' + keys[index] + '.' + ext,
            Body: file.buffer,
        }
    })
    const results = await Promise.all(params.map(param => s3.upload(param).promise()))
    return results
}


// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
// export default async function s3Uploadv2(files, keys) {
//     console.log('upload', 1)
//     const s3Client = new S3Client({
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     })
//     console.log('upload', 2)
//     const params = files.map((file, index) => {
//         const ext = file.originalname.split('.').pop()
//         return {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: 'upload/' + keys[index] + '.' + ext,
//             Body: file.buffer,
//             Region: process.env.AWS_REGION
//         }
//     })
//     console.log('upload', 3)
//     return s3Client.send(new PutObjectCommand(params[0]))
// }


// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCrlHgLkpJVZb-ssdeBctBEnQMI5-IcvMM",
    authDomain: "jntuk-db.firebaseapp.com",
    projectId: "jntuk-db",
    storageBucket: "jntuk-db.appspot.com",
    messagingSenderId: "445267723993",
    appId: "1:445267723993:web:af0e11a9ba623af48060c8",
    measurementId: "G-2RV0S08Y0B"
}

// Initialize Firebase
// const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)