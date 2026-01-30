require("dotenv").config();

const express = require('express');

const app = express();
const mongoose = require("mongoose");
const cors = require('cors');

const cookieParser = require('cookie-parser')

const Port = process.env.PORT || 7000;
mongoose.connect(process.env.MONGO_URL).then(e => console.log("MongoDB is connected successfully...."))

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
    // origin: [
    //     "http://localhost:5173",
    //     "https://react-tail-admin-at-infilon.vercel.app"],

    
    origin:"https://react-tail-admin-at-infilon.vercel.app",
    credentials: true, //🔥 REQUIRED for cookies  , aa sikhvanu chhe ho....
}))



app.use("/auth", userRouter)
// app.use(authmiddleware)
app.use("/product", authmiddleware, productRouter);

app.listen(Port, () => {
    console.log("server started at port 7000");
})
