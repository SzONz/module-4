const express = require("express");
const multer = require("multer");

const {
  uploadMusic,
  getMyMusic,
  getMusic,
  getAllMusic,
  getMusicImage,
  streamMusic,
  updateMusic,
  deleteMusic,
} = require("../controllers/musicController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024,
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

    if (
      file.fieldname === "music" &&
      audioTypes.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    if (
      file.fieldname === "background" &&
      imageTypes.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Invalid file type. Upload a supported audio file and JPG, PNG, or WebP image."
      )
    );
  },
});



router.get("/all", getAllMusic);



router.get(
  "/my-music",
  protect,
  getMyMusic
);



router.put(
  "/:id",
  protect,
  updateMusic
);

router.delete(
  "/:id",
  protect,
  deleteMusic
);



router.get(
  "/:id/image",
  getMusicImage
);

router.get(
  "/:id/stream",
  streamMusic
);

router.get(
  "/:id",
  getMusic
);

router.post(
  "/upload",
  protect,
  upload.fields([
    {
      name: "music",
      maxCount: 1,
    },
    {
      name: "background",
      maxCount: 1,
    },
  ]),
  uploadMusic
);

module.exports = router;