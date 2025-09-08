import express from "express";
import { getUser, getUserAll, login, logout, signUp } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/current-user", authMiddleware , getUser);
router.get('/all-user',authMiddleware,getUserAll);

export default router;
