const Playlist = require("../models/Playlist");
const Music = require("../models/Music");

const createPlaylist = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description.trim(),
      owner: req.user._id,
      songs: [],
    });

    res.status(201).json({
      success: true,
      playlist,
    });
  } catch (error) {
    console.error("Create playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create playlist",
    });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({
      owner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("songs");

    res.json({
      success: true,
      playlists,
    });
  } catch (error) {
    console.error("Get playlists error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load playlists",
    });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("songs");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.json({
      success: true,
      playlist,
    });
  } catch (error) {
    console.error("Get playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load playlist",
    });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Playlist name cannot be empty",
        });
      }

      playlist.name = name.trim();
    }

    if (description !== undefined) {
      playlist.description = description.trim();
    }

    await playlist.save();

    res.json({
      success: true,
      playlist,
    });
  } catch (error) {
    console.error("Update playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update playlist",
    });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Delete playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete playlist",
    });
  }
};

const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    const song = await Music.findById(songId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    const alreadyExists = playlist.songs.some(
      (id) => id.toString() === songId.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Song is already in this playlist",
      });
    }

    playlist.songs.push(song._id);

    await playlist.save();

    await playlist.populate("songs");

    res.json({
      success: true,
      message: "Song added to playlist",
      playlist,
    });
  } catch (error) {
    console.error("Add song to playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add song to playlist",
    });
  }
};

const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    playlist.songs = playlist.songs.filter(
      (songId) => songId.toString() !== req.params.songId.toString()
    );

    await playlist.save();

    await playlist.populate("songs");

    res.json({
      success: true,
      message: "Song removed from playlist",
      playlist,
    });
  } catch (error) {
    console.error("Remove song from playlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove song from playlist",
    });
  }
};

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
};