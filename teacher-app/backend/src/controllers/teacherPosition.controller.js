const TeacherPosition = require("../models/TeacherPosition");

const getTeacherPositions = async (req, res, next) => {
    try {
        const positions = await TeacherPosition.find({
        isDeleted: false
        })
        .sort({ createdAt: 1 })
        .lean();

        return res.status(200).json({
        success: true,
        data: positions
        });
    } catch (error) {
        next(error);
    }
    };

    const createTeacherPosition = async (
    req,
    res,
    next
    ) => {
    try {
        const {
        code,
        name,
        des,
        isActive = true
        } = req.body;

        if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            message: "Mã vị trí là bắt buộc"
        });
        }

        if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Tên vị trí là bắt buộc"
        });
        }

        if (!des || !des.trim()) {
        return res.status(400).json({
            success: false,
            message: "Mô tả là bắt buộc"
        });
        }

        const normalizedCode =
        code.trim().toUpperCase();

        const existing =
        await TeacherPosition.findOne({
            code: normalizedCode
        });

        if (existing) {
        return res.status(409).json({
            success: false,
            message: "Mã vị trí đã tồn tại"
        });
        }

        const position =
        await TeacherPosition.create({
            code: normalizedCode,

            name: name.trim(),

            des: des.trim(),

            isActive,

            isDeleted: false
        });

        return res.status(201).json({
        success: true,
        message: "Tạo vị trí công tác thành công",
        data: position
        });
    } catch (error) {
        if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Mã vị trí đã tồn tại"
        });
        }

        next(error);
    }
};

module.exports = {
    getTeacherPositions,
    createTeacherPosition
};