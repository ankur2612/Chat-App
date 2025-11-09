import express from "express";
import { signup, login, updateProfile, checkAuth,logout } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router= express.Router();

router.post("/signup", signup);
router.post("/login", login);   
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);
router.post("/logout", protectRoute, logout);

export default router;
