import mongoose from "mongoose"

const regulationSchema = new mongoose.Schema({
    regulation: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^R\d\d$/.test(v)
            },
        },
    },
    year: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4],
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2],
    },
    branch: {
        type: String,
        required: true,
        enum: ['01', '02', '03', '04', '05', '27', '08'],
    },
    specialization: {
        type: String,
        default: 'general',
    },
    subjects: {
        type: Object,
        default: {}
    },
})

regulationSchema.index({ regulation: 1, year: 1, semester: 1, branch: 1, specialization: 1 }, { unique: true })

export default mongoose.model("regulation", regulationSchema)
