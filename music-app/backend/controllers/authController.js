const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
    try {
        const {
        username,
        email,
        password,
        confirmPassword,
        } = req.body;

        if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
        }

        if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match",
        });
        }

        if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters",
        });
        }

        const existingUser = await User.findOne({
        $or: [
            { email: email.toLowerCase().trim() },
            { username: username.trim() },
        ],
        });

        if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Username or email already exists",
        });
        }


        const hashedPassword = await bcrypt.hash(
        password,
        12
        );

        const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        });

        const token = generateToken(user);

        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
        success: true,
        message: "Account created successfully",

        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
        success: false,
        message: "Server error",
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
        }

        const user = await User.findOne({
        email: email.toLowerCase().trim(),
        });

        if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
        }


        const passwordMatch = await bcrypt.compare(
        password,
        user.password
        );

        if (!passwordMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
        }

        const token = generateToken(user);

        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
        success: true,
        message: "Login successful",

        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
        success: false,
        message: "Server error",
        });
    }
};


const getMe = async (req, res) => {
    res.json({
        success: true,

        user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        },
    });
};



const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.json({
        success: true,
        message: "Logged out successfully",
    });
};


module.exports = {
    signup,
    login,
    getMe,
    logout,
};