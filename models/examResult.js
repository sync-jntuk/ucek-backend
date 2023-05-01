import mongoose from "mongoose"

const examResultSchema = new mongoose.Schema({
    roll: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{5}[A-Z]\d{4}$/.test(v)
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
    batch: {
        type: Number,
        required: true,
        min: 2016,
        validate: {
            validator: function (v) {
                return v % 1 == 0
            },
        },
    },
    subjects: {
        type: Object,
        default: {},
    },
})

examResultSchema.index({ roll: 1, year: 1, semester: 1 }, { unique: true })
examResultSchema.index({ batch: 1, year: 1, semester: 1 })

export default mongoose.model("examResult", examResultSchema)
