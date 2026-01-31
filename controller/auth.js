const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const createUser = async (req, res) => {

    try {
        const { fullName, email, password } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

        // console.log("REQ BODY:", req.body);
        // console.log("REQ FILE:", req.file);

        const isExistingEmail = await User.findOne({ email });
        if (isExistingEmail) {
            return res.status(400).json({ msg: "User already exitst " });
        }

        const hashedPaddword = await bcrypt.hash(password, 10);

        await User.create({
            fullName: fullName,
            email: email,
            password: hashedPaddword,
            profileImage: imagePath,
        })

        res.status(201).json({ msg: "user created successfully" });

    } catch (e) {
        res.status(400).json({
            msg: "server error for creating new user",
            error: e
        })

    }



}

const handleLoginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        // console.log("LOGIN BODY:", req.body);

        if (!email || !password) {
            return res.status(400).json({ msg: "email and password is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: " wrong details for email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: " wrong details for email or password" });
        }

        // if all ok then generate token and store in DB
        const accessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "7d"
            }
        )

        user.refreshToken = refreshToken;
        await user.save();


        res.cookie("accessToken", accessToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" required for cross-site in production
            domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
        })

        res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
        })

        res.json({
            msg: "user logged in succeefully  ",
            user: {
                id: user._id,
                fullName: user.fullName,
                profileImage: user.profileImage,
                role: user.role,
            }
        })
    }
    catch (e) {
        console.log("error in handleUserLogin : ", e);
        res.status(500).json({
            msg: "error in handleUserLogin ",
            stack: e.stack
        })
    }
}

const handleRefershToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ msg: "refreshtoken not found." })
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = User.findById(decoded.userId);
        if (!user || !user.refreshToken) {
            return res.status(403).json({ msg: "Invalid refreshToken" });
        }

        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m"
            }
        )

        res.cookie("accessToken", newAccessToken);

        res.json({ msg: "Token Refreshed Successfully......." })


    }
    catch (e) {
        console.log("Error in creating new accessToken via refreshToken");
        return res.status(403).json({ msg: "invalid or expired resfreshtoken" })
    }
}

const handleLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findByIdAndUpdate(decoded.userId, { refreshToken: null })
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ msg: "user loggedout successfully" })
    }
    catch (e) {
        res.status(500).json({ msg: "server error for logging out user" })
    }



}



module.exports = {
    createUser,
    handleLoginUser,
    handleRefershToken,
    handleLogout,
}