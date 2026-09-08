import { useState, useRef } from 'react';
import {
  Paper,
  Avatar,
  TextField,
  Box,
  IconButton,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !imageFile) {
      setError('Add some text or an image to post.');
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onPostCreated(data);
      setText('');
      removeImage();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
      <Box display="flex" gap={1.5}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
        <Box flex={1} component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder={`What's on your mind, ${user?.username}?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{ mb: 1 }}
          />

          {imagePreview && (
            <Box position="relative" mb={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
              />
              <IconButton
                size="small"
                onClick={removeImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {error && (
            <Typography variant="caption" color="error" display="block" mb={1}>
              {error}
            </Typography>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <IconButton component="label" color="primary">
              <ImageRoundedIcon />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
            </IconButton>
            <Button type="submit" variant="contained" disabled={posting}>
              {posting ? <CircularProgress size={20} color="inherit" /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;