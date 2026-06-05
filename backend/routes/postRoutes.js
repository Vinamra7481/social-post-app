const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  likePost,
  commentPost,
} = require("../controllers/postController");

const router = express.Router();

// Get all posts
router.get("/", getPosts);

// Create post
router.post("/", authMiddleware, createPost);

// Like post
router.post("/:id/like", authMiddleware, likePost);

// Comment on post
router.post("/:id/comment", authMiddleware, commentPost);

module.exports = router;