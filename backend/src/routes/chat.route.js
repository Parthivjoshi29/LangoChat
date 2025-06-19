import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreanToken, getVideoToken } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreanToken);
router.get("/video-token", protectRoute, getVideoToken);

export default router;
