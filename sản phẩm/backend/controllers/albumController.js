const mongoose = require("mongoose");

const Album = require("../models/Album");
const Music = require("../models/Music");

const uploadAlbum = async (req, res) => {
  const uploadedAudioIds = [];
  let uploadedCoverId = null;
  let albumId = null;

  try {
    const coverFile = req.files?.albumCover?.[0];
    const musicFiles = req.files?.music || [];

    const {
      title,
      artist,
      genre,
      description,
      trackTitles,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Album title is required",
      });
    }

    if (!artist || !artist.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist is required",
      });
    }

    if (!musicFiles.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one music file",
      });
    }

    let parsedTrackTitles = [];

    if (trackTitles) {
      try {
        parsedTrackTitles = JSON.parse(trackTitles);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid track titles",
        });
      }
    }

    if (
      parsedTrackTitles.length &&
      parsedTrackTitles.length !== musicFiles.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The number of track titles must match the number of music files",
      });
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    if (coverFile) {
      const coverUploadStream =
        bucket.openUploadStream(
          coverFile.originalname,
          {
            contentType: coverFile.mimetype,
            metadata: {
              type: "album-cover",
              uploadedBy: req.user._id,
            },
          }
        );

      uploadedCoverId = coverUploadStream.id;

      await new Promise((resolve, reject) => {
        coverUploadStream.on("finish", resolve);
        coverUploadStream.on("error", reject);

        coverUploadStream.end(
          coverFile.buffer
        );
      });
    }

    const album = await Album.create({
      title: title.trim(),
      artist: artist.trim(),
      genre: genre?.trim() || "Other",
      description: description?.trim() || "",

      coverImageId: uploadedCoverId,
      coverImageName:
        coverFile?.originalname || "",
      coverImageMimeType:
        coverFile?.mimetype || "",
      coverImageSize:
        coverFile?.size || 0,

      uploadedBy: req.user._id,
    });

    albumId = album._id;

    const tracks = [];

    for (
      let index = 0;
      index < musicFiles.length;
      index++
    ) {
      const musicFile = musicFiles[index];

      const trackNumber = index + 1;

      const trackTitle =
        parsedTrackTitles[index]?.trim() ||
        musicFile.originalname
          .replace(/\.[^/.]+$/, "")
          .trim();

      const audioUploadStream =
        bucket.openUploadStream(
          musicFile.originalname,
          {
            contentType: musicFile.mimetype,
            metadata: {
              type: "audio",
              albumId: album._id,
              uploadedBy: req.user._id,
              trackNumber,
            },
          }
        );

      uploadedAudioIds.push(
        audioUploadStream.id
      );

      await new Promise((resolve, reject) => {
        audioUploadStream.on("finish", resolve);
        audioUploadStream.on("error", reject);

        audioUploadStream.end(
          musicFile.buffer
        );
      });

      const track = await Music.create({
        albumId: album._id,
        title: trackTitle,
        artist: artist.trim(),
        album: title.trim(),
        trackNumber,
        genre: genre?.trim() || "Other",

        fileId: audioUploadStream.id,
        fileName: musicFile.originalname,
        mimeType: musicFile.mimetype,
        fileSize: musicFile.size,

        uploadedBy: req.user._id,
      });

      tracks.push(track);
    }

    res.status(201).json({
      success: true,
      message: "Album uploaded successfully",
      album,
      tracks,
    });
  } catch (error) {
    console.error(
      "Upload album error:",
      error
    );

    try {
      const db = mongoose.connection.db;

      const bucket =
        new mongoose.mongo.GridFSBucket(
          db,
          {
            bucketName: "music",
          }
        );

      for (const fileId of uploadedAudioIds) {
        await bucket
          .delete(fileId)
          .catch(() => {});
      }

      if (uploadedCoverId) {
        await bucket
          .delete(uploadedCoverId)
          .catch(() => {});
      }

      if (albumId) {
        await Album.findByIdAndDelete(
          albumId
        ).catch(() => {});

        await Music.deleteMany({
          albumId,
        }).catch(() => {});
      }
    } catch (cleanupError) {
      console.error(
        "Album cleanup error:",
        cleanupError
      );
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload album",
    });
  }
};

const getMyAlbums = async (req, res) => {
  try {
    const albums = await Album.find({
      uploadedBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const albumsWithTracks =
      await Promise.all(
        albums.map(async (album) => {
          const tracks = await Music.find({
            albumId: album._id,
          }).sort({
            trackNumber: 1,
          });

          return {
            ...album.toObject(),
            tracks,
          };
        })
      );

    res.json({
      success: true,
      albums: albumsWithTracks,
    });
  } catch (error) {
    console.error(
      "Get my albums error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load your albums",
    });
  }
};

const getAlbum = async (req, res) => {
  try {
    const album = await Album.findById(
      req.params.id
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const tracks = await Music.find({
      albumId: album._id,
    }).sort({
      trackNumber: 1,
    });

    res.json({
      success: true,
      album: {
        ...album.toObject(),
        tracks,
      },
    });
  } catch (error) {
    console.error(
      "Get album error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load album",
    });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message:
          "Album not found or you are not the owner",
      });
    }

    const {
      title,
      artist,
      genre,
      description,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Album title is required",
      });
    }

    if (!artist || !artist.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist is required",
      });
    }

    const oldTitle = album.title;

    album.title = title.trim();
    album.artist = artist.trim();
    album.genre =
      genre?.trim() || "Other";
    album.description =
      description?.trim() || "";

    await album.save();

    await Music.updateMany(
      {
        albumId: album._id,
        uploadedBy: req.user._id,
      },
      {
        $set: {
          artist: artist.trim(),
          album: title.trim(),
          genre:
            genre?.trim() || "Other",
        },
      }
    );

    res.json({
      success: true,
      message: "Album updated successfully",
      album,
      previousTitle: oldTitle,
    });
  } catch (error) {
    console.error(
      "Update album error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update album",
    });
  }
};


const deleteAlbum = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const albumQuery = {
      _id: req.params.id,
    };

    if (!isAdmin) {
      albumQuery.uploadedBy = req.user._id;
    }

    const album = await Album.findOne(albumQuery);

    if (!album) {
      return res.status(404).json({
        success: false,
        message:
          "Album not found or you are not authorized to delete it",
      });
    }

    const trackQuery = {
      albumId: album._id,
    };

    if (!isAdmin) {
      trackQuery.uploadedBy = req.user._id;
    }

    const tracks = await Music.find(trackQuery);

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "music",
    });

    for (const track of tracks) {
      if (track.fileId) {
        await bucket
          .delete(new mongoose.Types.ObjectId(track.fileId))
          .catch((error) => {
            console.error(
              `Failed to delete track file ${track._id}:`,
              error
            );
          });
      }

      if (track.imageId) {
        await bucket
          .delete(new mongoose.Types.ObjectId(track.imageId))
          .catch(() => {});
      }
    }

    if (album.coverImageId) {
      await bucket
        .delete(
          new mongoose.Types.ObjectId(album.coverImageId)
        )
        .catch((error) => {
          console.error(
            "Failed to delete album cover:",
            error
          );
        });
    }

    await Music.deleteMany({
      albumId: album._id,
    });

    await Album.deleteOne({
      _id: album._id,
    });

    res.json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("Delete album error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete album",
    });
  }
};

const updateAlbumTrack = async (
  req,
  res
) => {
  try {
    const track = await Music.findOne({
      _id: req.params.trackId,
      albumId: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!track) {
      return res.status(404).json({
        success: false,
        message:
          "Track not found or you are not the owner",
      });
    }

    const {
      title,
      artist,
      genre,
      trackNumber,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Track title is required",
      });
    }

    if (artist !== undefined && !artist.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist cannot be empty",
      });
    }

    track.title = title.trim();

    if (artist !== undefined) {
      track.artist = artist.trim();
    }

    if (genre !== undefined) {
      track.genre =
        genre.trim() || "Other";
    }

    if (
      trackNumber !== undefined &&
      trackNumber !== null &&
      trackNumber !== ""
    ) {
      const parsedNumber =
        Number(trackNumber);

      if (
        !Number.isInteger(parsedNumber) ||
        parsedNumber < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Track number must be a positive integer",
        });
      }

      track.trackNumber =
        parsedNumber;
    }

    await track.save();

    res.json({
      success: true,
      message:
        "Album track updated successfully",
      track,
    });
  } catch (error) {
    console.error(
      "Update album track error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update album track",
    });
  }
};

const deleteAlbumTrack = async (
  req,
  res
) => {
  try {
    const track = await Music.findOne({
      _id: req.params.trackId,
      albumId: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!track) {
      return res.status(404).json({
        success: false,
        message:
          "Track not found or you are not the owner",
      });
    }

    const db = mongoose.connection.db;

    const bucket =
      new mongoose.mongo.GridFSBucket(
        db,
        {
          bucketName: "music",
        }
      );

    if (track.fileId) {
      await bucket
        .delete(
          new mongoose.Types.ObjectId(
            track.fileId
          )
        )
        .catch((error) => {
          console.error(
            "Failed to delete track audio:",
            error
          );
        });
    }

    if (track.imageId) {
      await bucket
        .delete(
          new mongoose.Types.ObjectId(
            track.imageId
          )
        )
        .catch(() => {});
    }

    await Music.deleteOne({
      _id: track._id,
      albumId: req.params.id,
      uploadedBy: req.user._id,
    });

    const remainingTracks =
      await Music.find({
        albumId: req.params.id,
        uploadedBy: req.user._id,
      }).sort({
        trackNumber: 1,
      });

    for (
      let index = 0;
      index < remainingTracks.length;
      index++
    ) {
      remainingTracks[index].trackNumber =
        index + 1;

      await remainingTracks[index].save();
    }

    res.json({
      success: true,
      message:
        "Album track deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete album track error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete album track",
    });
  }
};

const getAlbumCover = async (req, res) => {
  try {
    const album = await Album.findById(
      req.params.id
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    if (!album.coverImageId) {
      return res.status(404).json({
        success: false,
        message:
          "This album has no cover image",
      });
    }

    const db = mongoose.connection.db;

    const bucket =
      new mongoose.mongo.GridFSBucket(
        db,
        {
          bucketName: "music",
        }
      );

    const files = await bucket
      .find({
        _id: new mongoose.Types.ObjectId(
          album.coverImageId
        ),
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message:
          "Album cover not found",
      });
    }

    const file = files[0];

    res.set(
      "Content-Type",
      file.contentType ||
        album.coverImageMimeType ||
        "image/jpeg"
    );

    res.set(
      "Content-Length",
      file.length
    );

    const downloadStream =
      bucket.openDownloadStream(
        album.coverImageId
      );

    downloadStream.on(
      "error",
      (error) => {
        console.error(
          "Album cover stream error:",
          error
        );

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message:
              "Failed to stream album cover",
          });
        }
      }
    );

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Get album cover error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load album cover",
    });
  }
};

const streamMusic = async (req, res) => {
  try {
    const music = await Music.findById(
      req.params.id
    );

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Music not found",
      });
    }

    const db = mongoose.connection.db;

    const bucket =
      new mongoose.mongo.GridFSBucket(
        db,
        {
          bucketName: "music",
        }
      );

    const files = await bucket
      .find({
        _id: new mongoose.Types.ObjectId(
          music.fileId
        ),
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message:
          "Audio file not found",
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

    const downloadStream =
      bucket.openDownloadStream(
        music.fileId
      );

    downloadStream.on(
      "error",
      (error) => {
        console.error(
          "Music stream error:",
          error
        );

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message:
              "Failed to stream music",
          });
        }
      }
    );

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Stream music error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to stream music",
    });
  }
};

module.exports = {
  uploadAlbum,
  getMyAlbums,
  getAlbum,
  getAlbumCover,
  streamMusic,

  updateAlbum,
  deleteAlbum,
  updateAlbumTrack,
  deleteAlbumTrack,
};