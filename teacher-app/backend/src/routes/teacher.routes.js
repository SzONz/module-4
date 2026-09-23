const express = require("express");

const {
    getTeachers,
    createTeacher
} = require("../controllers/teacher.controller");

const router = express.Router();

router.get("/", getTeachers);

router.post("/", createTeacher);

module.exports = router;