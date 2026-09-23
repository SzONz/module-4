const express = require("express");

const {
  createPlaylist,
  getMyPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} = require("../controllers/playlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createPlaylist);

router.get("/my-playlists", getMyPlaylists);

router.get("/:id", getPlaylist);

router.put("/:id", updatePlaylist);

router.delete("/:id", deletePlaylist);

router.post("/:id/songs", addSongToPlaylist);

router.delete("/:id/songs/:songId", removeSongFromPlaylist);

module.exports = router;