import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPost,
  getFollowingPost,
  getUserPost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createPost);
router.post("/like/:id", authMiddleware, likeUnlikePost);
router.post("/comment/:id", authMiddleware, commentOnPost);
router.delete("/:id", authMiddleware, deletePost);
router.get("/", authMiddleware, getAllPosts);
router.get("/liked-posts/:id", authMiddleware, getLikedPost);
router.get("/user/:username", authMiddleware, getUserPost);
router.get("/get-following-post", authMiddleware, getFollowingPost);

export default router;
