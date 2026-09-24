const express = require("express");
const multer = require("multer");

const {
  uploadAlbum,
  getMyAlbums,
  getAlbum,
  getAlbumCover,
  updateAlbum,
  deleteAlbum,
  updateAlbumTrack,
  deleteAlbumTrack,
} = require("../controllers/albumController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024,

    files: 51,
  },

  fileFilter: (req, file, cb) => {
    const audioTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/flac",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ];

    const imageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (file.fieldname === "albumCover") {
      if (imageTypes.includes(file.mimetype)) {
        return cb(null, true);
      }

      return cb(
        new Error(
          "Album cover must be JPG, PNG, or WebP"
        )
      );
    }

    if (file.fieldname === "music") {
      if (audioTypes.includes(file.mimetype)) {
        return cb(null, true);
      }

      return cb(
        new Error(
          "Music files must be MP3, WAV, FLAC, M4A, AAC, OGG, or WebM"
        )
      );
    }

    return cb(
      new Error("Unexpected file field")
    );
  },
});



router.get(
  "/my-albums",
  protect,
  getMyAlbums
);



router.get(
  "/:id/cover",
  getAlbumCover
);



router.post(
  "/upload",
  protect,
  upload.fields([
    {
      name: "albumCover",
      maxCount: 1,
    },
    {
      name: "music",
      maxCount: 50,
    },
  ]),
  uploadAlbum
);



router.put(
  "/:id",
  protect,
  updateAlbum
);


router.delete(
  "/:id",
  protect,
  deleteAlbum
);


router.put(
  "/:id/tracks/:trackId",
  protect,
  updateAlbumTrack
);



router.delete(
  "/:id/tracks/:trackId",
  protect,
  deleteAlbumTrack
);



router.get(
  "/:id",
  protect,
  getAlbum
);

module.exports = router;