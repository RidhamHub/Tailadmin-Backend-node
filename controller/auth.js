const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "defaultAccessTokenSecret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "defaultRefreshTokenSecret";
const isProd = process.env.NODE_ENV === "production";

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.warn("WARNING: ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not set. Falling back to default secrets.");
}

const createUser = async (req, res) => {

    try {
        const { fullName, email, password } = req.body;

        // Handle file upload - support both disk and memory storage
        let imagePath = "";
        if (req.file) {
            if (req.file.buffer) {
                // Memory storage (Vercel serverless) - convert to base64
                // Note: For production, consider using cloud storage (S3, Cloudinary, etc.)
                const base64Image = req.file.buffer.toString('base64');
                const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
                imagePath = dataUri;
            } else {
                // Disk storage (local development)
                imagePath = `/uploads/${req.file.filename}`;
            }
        }

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
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            REFRESH_TOKEN_SECRET,
            {
                expiresIn: "7d"
            }
        )

        user.refreshToken = refreshToken;
        await user.save();

        // Cookie settings - secure only in production
        const isProduction = process.env.NODE_ENV === "production";

        // res.cookie("accessToken", accessToken, {
        //     httpOnly: true,
        //     secure: isProduction,          // Only secure in production (HTTPS)
        //     sameSite: isProduction ? "none" : "lax",      // "none" for cross-domain in production, "lax" for localhost
        //     path: "/",             // 🔥 REQUIRED (VERY IMPORTANT)
        //     maxAge: 15 * 60 * 1000,
        // });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: isProduction,
        //     sameSite: isProduction ? "none" : "lax",
        //     path: "/",             // 🔥 REQUIRED
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // });


        res.json({
            msg: "user logged in succeefully  ",
            user: {
                id: user._id,
                fullName: user.fullName,
                profileImage: user.profileImage,
                role: user.role,
            },
            tokens: {
                accessToken,
                refreshToken
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
        // Try to get refresh token from cookies, body, or headers
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken || (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : null);
        if (!refreshToken) {
            return res.status(401).json({ msg: "refreshtoken not found." })
        }

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshToken) {
            return res.status(403).json({ msg: "Invalid refreshToken" });
        }

        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const isProduction = process.env.NODE_ENV === "production";

        // Set cookie if possible
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });

        // Also return in response body for localStorage usage
        res.json({
            msg: "Token Refreshed Successfully.......",
            accessToken: newAccessToken
        })


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
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
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