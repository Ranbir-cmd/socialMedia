import express from 'express';
import { createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost } from '../controllers/post.controller.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';
const router = express.Router();

router.get("/feed", protectedRoute, getFeedPosts);
router.get("/:postId",  getPost);
router.get("/user/:username",  getUserPosts);
router.post("/create", protectedRoute, createPost);
router.delete("/:postId", protectedRoute, deletePost);
router.put("/like/:postId", protectedRoute, likeUnlikePost);
router.put("/reply/:postId", protectedRoute, replyToPost);

export default router;