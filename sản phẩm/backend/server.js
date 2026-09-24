require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const albumRoutes = require("./routes/albumRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/music",
  musicRoutes
);

app.use(
  "/api/albums",
  albumRoutes
);

app.use(
  "/api/playlists", 
  playlistRoutes
);

app.use(
  "/api/admin", 
  adminRoutes
);

app.get("/", (req, res) => {
  res.json({
    message: "Soundly API is running",
  });
});

app.use(
  (err, req, res, next) => {
    console.error(err);

    if (err instanceof multer?.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(400).json({
      success: false,
      message:
        err.message ||
        "Something went wrong",
    });
  }
);


app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
