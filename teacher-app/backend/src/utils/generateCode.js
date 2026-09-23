const Teacher = require("../models/Teacher");

const generateTeacherCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0");

        exists = await Teacher.exists({ code });
    }

    return code;
};

module.exports = {
    generateTeacherCode
};