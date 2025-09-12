import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteNotification ,getNotification ,deleteNotificationOne } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/",authMiddleware,getNotification);
router.delete("/:id",authMiddleware,deleteNotificationOne);
router.delete("/",authMiddleware,deleteNotification)


export default router;