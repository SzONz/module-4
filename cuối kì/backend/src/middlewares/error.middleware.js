const errorMiddleware = (
    err,
    req,
    res,
    next
    ) => {
    console.error(err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: Object.values(err.errors).map(
            (item) => item.message
        )
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

module.exports = errorMiddleware;