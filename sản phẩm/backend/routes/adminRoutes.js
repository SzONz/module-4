const express = require("express");

const {
  getAllUsers,
  getAllMusic,
  getAllAlbums,
  deleteUser,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();



router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);



router.get(
  "/music",
  protect,
  authorize("admin"),
  getAllMusic
);



router.get(
  "/albums",
  protect,
  authorize("admin"),
  getAllAlbums
);

module.exports = router;