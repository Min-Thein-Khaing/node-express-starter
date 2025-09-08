import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api/auth", authRouter);


await connectDB()
app.listen(
  port,
  () =>
  console.log(`Server is running on port http://localhost:${port}`)
);
