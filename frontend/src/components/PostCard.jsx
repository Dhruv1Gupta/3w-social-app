import { useState } from 'react';
import { Paper, Avatar, Box, Typography, IconButton, Collapse, Tooltip } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';
import CommentSection from './CommentSection.jsx';

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const isLiked = post.likes?.some((l) => l.user === user?.id || l.username === user?.username);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      onUpdate(post._id, { likes: data.likes });
    } catch (err) {
      console.error('Failed to toggle like', err);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentAdded = (postId, comments) => {
    onUpdate(postId, { comments });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{post.username?.[0]?.toUpperCase()}</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {post.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(post.createdAt)}
          </Typography>
        </Box>
      </Box>

      {post.text && (
        <Typography variant="body1" sx={{ mb: post.image ? 1.5 : 1, whiteSpace: 'pre-wrap' }}>
          {post.text}
        </Typography>
      )}

      {post.image && (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1 }}>
          <img
            src={post.image}
            alt="post"
            style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }}
          />
        </Box>
      )}

      <Box display="flex" alignItems="center" gap={0.5} mt={1}>
        <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
          <IconButton onClick={handleLike} disabled={liking} size="small" color="error">
            {isLiked ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" mr={2}>
          {post.likes?.length || 0}
        </Typography>

        <IconButton onClick={() => setShowComments((s) => !s)} size="small">
          <ChatBubbleOutlineRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.comments?.length || 0}
        </Typography>
      </Box>

      <Collapse in={showComments}>
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          onCommentAdded={handleCommentAdded}
        />
      </Collapse>
    </Paper>
  );
};

export default PostCard;