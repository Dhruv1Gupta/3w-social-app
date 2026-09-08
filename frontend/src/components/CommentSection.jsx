import { useState } from 'react';
import { Box, Avatar, TextField, IconButton, Typography, Stack } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';

const CommentSection = ({ postId, comments, onCommentAdded }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text: text.trim() });
      onCommentAdded(postId, data.comments);
      setText('');
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box mt={1.5} pt={1.5} borderTop="1px solid #eee">
      <Stack spacing={1} mb={1.5} maxHeight={220} sx={{ overflowY: 'auto' }}>
        {comments.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        )}
        {comments.map((c, idx) => (
          <Box key={c._id || idx} display="flex" gap={1} alignItems="flex-start">
            <Avatar sx={{ width: 26, height: 26, fontSize: 12, bgcolor: 'secondary.main' }}>
              {c.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box
              sx={{
                bgcolor: '#F5F5F7',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                maxWidth: '85%',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block">
                {c.username}
              </Typography>
              <Typography variant="body2">{c.text}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Box component="form" onSubmit={handleAddComment} display="flex" gap={1} alignItems="center">
        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
        />
        <IconButton type="submit" color="primary" disabled={!text.trim() || submitting}>
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CommentSection;