const mongoose = require("mongoose");

const User = require("../models/User");
const Teacher = require("../models/Teacher");
const TeacherPosition = require("../models/TeacherPosition");

const { generateTeacherCode } = require("../utils/generateCode");

// =====================================================
// GET /teachers
// =====================================================

const getTeachers = async (req, res, next) => {
    try {
        let { page = 1, limit = 10 } = req.query;

        page = Number(page);
        limit = Number(limit);

        if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
            success: false,
            message: "page phải là số nguyên >= 1"
        });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            message: "limit phải là số nguyên từ 1 đến 100"
        });
        }

        const skip = (page - 1) * limit;

        const filter = {
        isDeleted: false
        };

        const total = await Teacher.countDocuments(filter);

        const teachers = await Teacher.find(filter)
        .populate({
            path: "userId",
            select:
            "name email phoneNumber address identity dob isDeleted role"
        })
        .populate({
            path: "teacherPositionsId",
            select: "name code des isActive isDeleted"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        const data = teachers.map((teacher) => {
        const user = teacher.userId || {};

        return {
            _id: teacher._id,

            code: teacher.code,

            name: user.name || null,

            email: user.email || null,

            phoneNumber: user.phoneNumber || null,

            address: user.address || null,

            identity: user.identity || null,

            dob: user.dob || null,

            isActive: teacher.isActive,

            startDate: teacher.startDate,

            endDate: teacher.endDate,

            teacherPositions: teacher.teacherPositionsId || [],

            degrees: teacher.degrees || []
        };
        });

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
        success: true,

        data,

        pagination: {
            page,
            limit,
            total,
            totalPages,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1
        }
        });
    } catch (error) {
        next(error);
    }
    };


    const createTeacher = async (req, res, next) => {
    try {
        const {
        name,
        email,
        phoneNumber,
        address,
        identity,
        dob,

        isActive = true,

        startDate,
        endDate,

        teacherPositionsId = [],

        degrees = []
        } = req.body;


        if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Tên giáo viên là bắt buộc"
        });
        }

        if (!email || !email.trim()) {
        return res.status(400).json({
            success: false,
            message: "Email là bắt buộc"
        });
        }

        const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Email không hợp lệ"
        });
        }


        const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
        isDeleted: false
        });

        if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email đã tồn tại"
        });
        }


        if (!Array.isArray(teacherPositionsId)) {
        return res.status(400).json({
            success: false,
            message: "teacherPositionsId phải là một mảng"
        });
        }

        if (teacherPositionsId.length > 0) {
        const validPositions =
            await TeacherPosition.find({
            _id: {
                $in: teacherPositionsId
            },
            isDeleted: false
            });

        if (
            validPositions.length !==
            teacherPositionsId.length
        ) {
            return res.status(400).json({
            success: false,
            message: "Có vị trí công tác không tồn tại"
            });
        }
        }


        if (!Array.isArray(degrees)) {
        return res.status(400).json({
            success: false,
            message: "degrees phải là một mảng"
        });
        }

        for (const degree of degrees) {
        if (
            !degree.type ||
            !degree.school ||
            !degree.major ||
            !degree.year
        ) {
            return res.status(400).json({
            success: false,
            message:
                "Mỗi học vấn phải có type, school, major, year"
            });
        }

        if (
            typeof degree.year !== "number" ||
            degree.year < 1900 ||
            degree.year > new Date().getFullYear()
        ) {
            return res.status(400).json({
            success: false,
            message: "Năm tốt nghiệp không hợp lệ"
            });
        }
        }


        const code = await generateTeacherCode();


        const user = await User.create({
        name: name.trim(),

        email: email.trim().toLowerCase(),

        phoneNumber,

        address,

        identity,

        dob,

        role: "TEACHER",

        isDeleted: false
        });


        try {
        const teacher = await Teacher.create({
            userId: user._id,

            code,

            isActive,

            isDeleted: false,

            startDate: startDate
            ? new Date(startDate)
            : new Date(),

            endDate: endDate
            ? new Date(endDate)
            : null,

            teacherPositionsId,

            degrees
        });

        const result = await Teacher.findById(
            teacher._id
        )
            .populate({
            path: "userId",
            select:
                "name email phoneNumber address identity dob role"
            })
            .populate({
            path: "teacherPositionsId",
            select: "name code des isActive"
            });

        return res.status(201).json({
            success: true,
            message: "Tạo giáo viên thành công",
            data: result
        });
        } catch (teacherError) {
        await User.findByIdAndDelete(user._id);

        throw teacherError;
        }
    } catch (error) {
        if (error.code === 11000) {
        const duplicateField = Object.keys(
            error.keyPattern || {}
        )[0];

        return res.status(409).json({
            success: false,
            message: `${duplicateField} đã tồn tại`
        });
        }

        next(error);
    }
};

module.exports = {
    getTeachers,
    createTeacher
};