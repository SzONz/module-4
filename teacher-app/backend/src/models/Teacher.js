const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema(
    {
        type: {
        type: String,
        required: true,
        trim: true
        },

        school: {
        type: String,
        required: true,
        trim: true
        },

        major: {
        type: String,
        required: true,
        trim: true
        },

        year: {
        type: Number,
        required: true
        },

        isGraduated: {
        type: Boolean,
        default: false
        }
    },
    {
        _id: true
    }
    );

    const teacherSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
        },

        isActive: {
        type: Boolean,
        default: true
        },

        isDeleted: {
        type: Boolean,
        default: false
        },

        code: {
        type: String,
        required: true,
        unique: true,
        match: /^\d{10}$/
        },

        startDate: {
        type: Date,
        default: Date.now
        },

        endDate: {
        type: Date,
        default: null
        },

        teacherPositionsId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TeacherPosition"
        }
        ],

        degrees: [degreeSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Teacher", teacherSchema);