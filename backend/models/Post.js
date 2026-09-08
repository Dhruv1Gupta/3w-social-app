const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }, // denormalized for fast feed reads
    text: { type: String, trim: true, maxlength: 2000 },
    image: { type: String, default: '' }, // Cloudinary URL

    // Store usernames of people who liked, as required by the task spec
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
      },
    ],

    comments: [CommentSchema],
  },
  { timestamps: true }
);

// Either text or image must be present (not both mandatory, but at least one)
PostSchema.pre('validate', function (next) {
  if (!this.text && !this.image) {
    next(new Error('Post must contain text, an image, or both.'));
  } else {
    next();
  }
});

// Index for feed pagination performance
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);