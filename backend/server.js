import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import { connectDB } from "./config/db.js";
import {v2 as cloudinary} from "cloudinary"
import cookieParser from "cookie-parser";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(express.json()); // JSON request body parsing
app.use(express.urlencoded({ extended: true })); // form data parsing
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)


await connectDB()
app.listen(
  port,
  () =>
  console.log(`Server is running on port http://localhost:${port}`)
);
