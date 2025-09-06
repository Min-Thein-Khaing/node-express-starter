import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use("/api/auth", authRouter);

app.listen(
  port,
  () => connectDB(),
  console.log(`Server is running on port http://localhost:${port}`)
);
