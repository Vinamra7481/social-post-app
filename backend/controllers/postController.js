const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    const user = await User.findById(req.user.id);

    const post = await Post.create({
      user: user._id,
      username: user.username,
      text,
      image,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LIKE POST
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    const alreadyLiked = post.likes.find(
      (like) => like.userId.toString() === req.user.id
    );

    if (alreadyLiked) {
      return res.status(400).json({
        message: "Post already liked",
      });
    }

    post.likes.push({
      userId: user._id,
      username: user.username,
    });

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// COMMENT ON POST
const commentPost = async (req, res) => {
  try {
    const { comment } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    post.comments.push({
      userId: user._id,
      username: user.username,
      comment,
    });

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentPost,
};
