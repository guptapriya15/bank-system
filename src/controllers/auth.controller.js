import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * Register User Controller
 * POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const isExists = await User.findOne({ email });

        if (isExists) {
            return res.status(409).json({
                message: "User already exists with this email",
                status: "failed"
            });
        }

        const user = await User.create({
            email,
            password,
            name
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User registered successfully",
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
};


/**
 * User Login Controller
 * POST /api/auth/login
 */
const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Email or password is INVALID",
                status: "failed"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is INVALID",
                status: "failed"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
};

export {
    userRegisterController,
    userLoginController
};