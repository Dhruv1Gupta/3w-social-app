import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import Navbar from '../components/Navbar.jsx';
import CreatePost from '../components/CreatePost.jsx';
import PostCard from '../components/PostCard.jsx';
import api from '../api/axios';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum) => {
    try {
      const { data } = await api.get(`/posts?page=${pageNum}&limit=10`);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.hasMore);
    } catch (err) {
      setError('Failed to load feed. Please refresh the page.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Infinite scroll via IntersectionObserver for efficient pagination
  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setPage((prev) => {
            const next = prev + 1;
            fetchPosts(next);
            return next;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadingMore, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <CreatePost onPostCreated={handlePostCreated} />

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center" my={2}>
            {error}
          </Typography>
        )}

        {!loading && posts.length === 0 && !error && (
          <Typography align="center" color="text.secondary" my={4}>
            No posts yet. Be the first to share something!
          </Typography>
        )}

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
        ))}

        {/* Sentinel element for infinite scroll pagination */}
        {hasMore && !loading && (
          <Box ref={sentinelRef} display="flex" justifyContent="center" py={2}>
            {loadingMore && <CircularProgress size={24} />}
          </Box>
        )}

        {!hasMore && posts.length > 0 && (
          <Typography align="center" color="text.secondary" variant="body2" py={2}>
            You're all caught up! 🎉
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Feed;