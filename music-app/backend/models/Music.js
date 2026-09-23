const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
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

    album: {
      type: String,
      default: "",
      trim: true,
    },

    genre: {
      type: String,
      default: "Other",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Album relationship
    |--------------------------------------------------------------------------
    */

    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },

    trackNumber: {
      type: Number,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Audio
    |--------------------------------------------------------------------------
    */

    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    imageName: {
      type: String,
      default: "",
    },

    imageMimeType: {
      type: String,
      default: "",
    },

    imageSize: {
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

module.exports = mongoose.model(
  "Music",
  musicSchema
);