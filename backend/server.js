import path from 'path';
import express from 'express';
import dotenv from "dotenv"
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import {app, server} from "./socket/socket.js";

// const app = express();
dotenv.config();
const port = process.env.PORT || 8000;

const __dirname = path.resolve()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import messageRoutes from "./routes/message.routes.js"

app.use(express.json({ limit: "50mb"}));    //to parse json data in req.body 
app.use(express.urlencoded({
    extended: true
})) // to parse formdata in req.body
app.use(cookieParser());    // get cookies from req, and set cookie to res 

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "/frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

server.listen(port, () => {
    connectDB()
    console.log(`Server started on port ${port}`);
});