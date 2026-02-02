require("dotenv").config();

const express = require('express');

const app = express();
const mongoose = require("mongoose");
const cors = require('cors');

const cookieParser = require('cookie-parser')

const Port = process.env.PORT || 7000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB is connected successfully...."))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.use(cors());

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files (for Vercel, we'll handle uploads differently)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.use("/uploads", express.static("uploads"));
}

const userRouter = require('./routes/auth')
// const productRouter = require('./routes/product')

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

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Backend is running",
    });
});


app.use("/auth", userRouter)
// app.use(authmiddleware)
// app.use("/product", productRouter);

// Export for Vercel serverless
module.exports = app;

// Only listen if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(Port, () => {
        console.log("server started at port " + Port);
    });
}
