const mongoose = require("mongoose");

const teacherPositionSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Tên vị trí là bắt buộc"],
        trim: true
        },

        code: {
        type: String,
        required: [true, "Mã vị trí là bắt buộc"],
        unique: true,
        trim: true,
        uppercase: true
        },

        des: {
        type: String,
        required: [true, "Mô tả là bắt buộc"],
        trim: true
        },

        isActive: {
        type: Boolean,
        default: true
        },

        isDeleted: {
        type: Boolean,
        default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TeacherPosition",
    teacherPositionSchema
);