require("dotenv").config();

const express = require('express');

const app = express();
const mongoose = require("mongoose");
const cors = require('cors');

const cookieParser = require('cookie-parser')

const Port = process.env.PORT || 7000;

if (process.env.MONGO_URL) {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log("MongoDB is connected successfully...."))
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
} else {
    console.warn("MONGO_URL not set. Continuing without MongoDB connection.");
}

const userRouter = require('./routes/auth')
const productRouter = require('./routes/product')

const authmiddleware = require("./middleware/authmiddleware")


const multer = require("multer");

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                msg: "Image size too large. Max 2MB allowed.",
            });
        }
        return res.status(400).json({ msg: err.message });
    }

    if (err) {
        return res.status(400).json({ msg: err.message });
    }

    next();
});


app.use("/uploads", express.static("uploads"));

app.use(cookieParser())

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://react-tail-admin-at-infilon.vercel.app",
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true
}));



app.use("/auth", userRouter)
// app.use(authmiddleware)
app.use("/product", authmiddleware, productRouter);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Backend is healthy",
        uptime: process.uptime()
    });
});

if (require.main === module) {
    app.listen(Port, () => {
        console.log(`server started at port ${Port}`);
    });
}

module.exports = app;
