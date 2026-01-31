require("dotenv").config();

const express = require('express');

const app = express();
const mongoose = require("mongoose");
const cors = require('cors');

const cookieParser = require('cookie-parser')

const Port = process.env.PORT || 7000;
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB is connected successfully...."))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
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
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Make it configurable
    credentials: true,
}))



app.use("/auth", userRouter)
// app.use(authmiddleware)
app.use("/product", authmiddleware, productRouter);

app.listen(Port, () => {
    console.log("server started at port 7000");
})
