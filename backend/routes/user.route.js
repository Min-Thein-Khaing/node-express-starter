import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();


router.get('/profile/:username',authMiddleware,getUserProfile);
router.get('/suggested-users',authMiddleware,getSuggestedUsers);
router.post("/follow/:id",authMiddleware,followUnfollowUser)
router.post("/update",authMiddleware,updateUser)

export default router;