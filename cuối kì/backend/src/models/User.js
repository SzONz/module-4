const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Tên là bắt buộc"],
        trim: true
        },

        email: {
        type: String,
        required: [true, "Email là bắt buộc"],
        unique: true,
        lowercase: true,
        trim: true
        },

        phoneNumber: {
        type: String,
        trim: true
        },

        address: {
        type: String,
        trim: true
        },

        identity: {
        type: String,
        trim: true
        },

        dob: {
        type: Date
        },

        isDeleted: {
        type: Boolean,
        default: false
        },

        role: {
        type: String,
        enum: ["STUDENT", "TEACHER", "ADMIN"],
        default: "TEACHER"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);