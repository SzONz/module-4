const User = require("../models/User");
const Music = require("../models/Music");
const Album = require("../models/Album");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

const getAllMusic = async (req, res) => {
  try {
    const music = await Music.find()
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      music,
    });
  } catch (error) {
    console.error("Get all music error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load music",
    });
  }
};

const getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
    .populate("uploadedBy", "username email")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      albums,
    });
  } catch (error) {
    console.error("Get all albums error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load albums",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.deleteOne({
      _id: user._id,
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllMusic,
  getAllAlbums,
  deleteUser,
};