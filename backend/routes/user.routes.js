import express from 'express';
import { followUnFollowUser, getSuggestedUsers, getUserProfile, loginUser, logoutUser, signupUser, updateUser } from '../controllers/user.controller.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';

const router = express.Router();

router.post("/signup", signupUser);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectedRoute, followUnFollowUser);
router.put("/update/:id", protectedRoute, updateUser)
router.get("/profile/:query", getUserProfile)

export default router;