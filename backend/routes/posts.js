const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Post = require('../models/Post');
const protect = require('../middleware/auth');
const router = express.Router();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// @route   POST /api/posts
// @desc    Create a post (text and/or image)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? req.file.path : '';

    if (!text && !image) {
      return res.status(400).json({ message: 'Post must contain text, an image, or both' });
    }

    const post = await Post.create({
      user: req.user.id,
      username: req.user.username,
      text: text || '',
      image,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// @route   GET /api/posts?page=1&limit=10
// @desc    Get paginated public feed, newest first
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching feed' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLikedIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLikedIndex > -1) {
      // Unlike
      post.likes.splice(alreadyLikedIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user.id, username: req.user.username });
    }

    await post.save();
    res.json({
      likesCount: post.likes.length,
      likes: post.likes,
      liked: alreadyLikedIndex === -1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user.id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      commentsCount: post.comments.length,
      comments: post.comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

module.exports = router;