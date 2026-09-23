const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
    {
        title: {
        type: String,
        required: true,
        trim: true,
        },

        artist: {
        type: String,
        required: true,
        trim: true,
        },

        genre: {
        type: String,
        default: "Other",
        trim: true,
        },

        description: {
        type: String,
        default: "",
        trim: true,
        },

        coverImageId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        },

        coverImageName: {
        type: String,
        default: "",
        },

        coverImageMimeType: {
        type: String,
        default: "",
        },

        coverImageSize: {
        type: Number,
        default: 0,
        },

        uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        },
        {
        timestamps: true,
    }
);

module.exports = mongoose.model("Album", albumSchema);
