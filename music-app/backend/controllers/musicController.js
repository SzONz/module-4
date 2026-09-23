const mongoose = require("mongoose");
const Music = require("../models/Music");

const uploadMusic = async (req, res) => {
  try {
    const musicFile = req.files?.music?.[0];
    const backgroundFile = req.files?.background?.[0];

    if (!musicFile) {
      return res.status(400).json({
        success: false,
        message: "Please select a music file",
      });
    }

    const { title, artist, album, genre } = req.body;

    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        message: "Song title and artist are required",
      });
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    const audioUploadStream = bucket.openUploadStream(
      musicFile.originalname,
      {
        contentType: musicFile.mimetype,
        metadata: {
          type: "audio",
          uploadedBy: req.user._id,
        },
      }
    );

    audioUploadStream.end(musicFile.buffer);

    audioUploadStream.on("finish", async () => {
      let imageId = null;

      try {

        if (backgroundFile) {
          const imageUploadStream = bucket.openUploadStream(
            backgroundFile.originalname,
            {
              contentType: backgroundFile.mimetype,
              metadata: {
                type: "background",
                uploadedBy: req.user._id,
              },
            }
          );

          imageId = imageUploadStream.id;

          imageUploadStream.end(backgroundFile.buffer);

          await new Promise((resolve, reject) => {
            imageUploadStream.on("finish", resolve);
            imageUploadStream.on("error", reject);
          });
        }

        const music = await Music.create({
          title: title.trim(),
          artist: artist.trim(),
          album: album?.trim() || "",
          genre: genre?.trim() || "Other",

          albumId: null,
          trackNumber: null,

          fileId: audioUploadStream.id,
          fileName: musicFile.originalname,
          mimeType: musicFile.mimetype,
          fileSize: musicFile.size,

          imageId,
          imageName: backgroundFile?.originalname || "",
          imageMimeType: backgroundFile?.mimetype || "",
          imageSize: backgroundFile?.size || 0,

          uploadedBy: req.user._id,
        });

        res.status(201).json({
          success: true,
          message: "Music uploaded successfully",
          music,
        });
      } catch (error) {
        console.error("Music metadata error:", error);

        await bucket
          .delete(audioUploadStream.id)
          .catch(() => {});

        if (imageId) {
          await bucket
            .delete(imageId)
            .catch(() => {});
        }

        res.status(500).json({
          success: false,
          message: "Failed to save music information",
        });
      }
    });

    audioUploadStream.on("error", (error) => {
      console.error("GridFS audio upload error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to upload music file",
        });
      }
    });
  } catch (error) {
    console.error("Upload music error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getMyMusic = async (req, res) => {
  try {
    const music = await Music.find({
      uploadedBy: req.user._id,
      albumId: null,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      music,
    });
  } catch (error) {
    console.error("Get my music error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load your music",
    });
  }
};


const getMusic = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Song not found or deleted",
      });
    }

    res.json({
      success: true,
      music,
    });
  } catch (error) {
    console.error("Get music error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load song",
    });
  }
};


const updateMusic = async (req, res) => {
  try {
    const music = await Music.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,

      albumId: null,
    });

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Song not found or you are not the owner",
      });
    }

    const {
      title,
      artist,
      album,
      genre,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Song title is required",
      });
    }

    if (!artist || !artist.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist is required",
      });
    }

    music.title = title.trim();
    music.artist = artist.trim();
    music.album = album?.trim() || "";
    music.genre = genre?.trim() || "Other";

    await music.save();

    res.json({
      success: true,
      message: "Song updated successfully",
      music,
    });
  } catch (error) {
    console.error("Update music error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update song",
    });
  }
};


const deleteMusic = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const query = {
      _id: req.params.id,
      albumId: null,
    };

    if (!isAdmin) {
      query.uploadedBy = req.user._id;
    }

    const music = await Music.findOne(query);

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Song not found or you are not authorized to delete it",
      });
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    if (music.fileId) {
      await bucket
        .delete(new mongoose.Types.ObjectId(music.fileId))
        .catch((error) => {
          console.error("Failed to delete audio file:", error);
        });
    }

    if (music.imageId) {
      await bucket
        .delete(new mongoose.Types.ObjectId(music.imageId))
        .catch((error) => {
          console.error("Failed to delete background image:", error);
        });
    }

    await Music.deleteOne({
      _id: music._id,
    });

    res.json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Delete music error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete song",
    });
  }
};


const getMusicImage = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Music not found",
      });
    }

    if (!music.imageId) {
      return res.status(404).json({
        success: false,
        message: "This song has no background image",
      });
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    const files = await bucket
      .find({
        _id: new mongoose.Types.ObjectId(music.imageId),
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "Background image not found in GridFS",
      });
    }

    const file = files[0];

    res.set(
      "Content-Type",
      file.contentType ||
        music.imageMimeType ||
        "image/jpeg"
    );

    res.set(
      "Content-Length",
      file.length
    );

    const downloadStream = bucket.openDownloadStream(
      music.imageId
    );

    downloadStream.on("error", (error) => {
      console.error(
        "GridFS image stream error:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to stream image",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Get music image error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load background image",
    });
  }
};

const streamMusic = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Music not found",
      });
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    const files = await bucket
      .find({
        _id: new mongoose.Types.ObjectId(music.fileId),
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "Audio file not found",
      });
    }

    const file = files[0];

    res.set(
      "Content-Type",
      file.contentType || music.mimeType
    );

    res.set(
      "Content-Length",
      file.length
    );

    const downloadStream = bucket.openDownloadStream(
      music.fileId
    );

    downloadStream.on("error", (error) => {
      console.error(
        "GridFS audio stream error:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to stream audio",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Stream music error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to stream music",
    });
  }
};


const getAllMusic = async (req, res) => {
  try {
    const music = await Music.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      music,
    });
  } catch (error) {
    console.error(
      "Get all music error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load music",
    });
  }
};

module.exports = {
  uploadMusic,
  getMyMusic,
  getMusic,
  getAllMusic,
  getMusicImage,
  streamMusic,
  updateMusic,
  deleteMusic,
};