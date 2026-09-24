const express = require("express");
const cors = require("cors");

const teacherRoutes = require("./routes/teacher.routes");
const teacherPositionRoutes = require("./routes/teacherPosition.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*"
    })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Teacher Management API is running"
    });
});

app.use("/api/teachers", teacherRoutes);

app.use(
    "/api/teacher-positions",
    teacherPositionRoutes
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

app.use(errorMiddleware);

module.exports = app;