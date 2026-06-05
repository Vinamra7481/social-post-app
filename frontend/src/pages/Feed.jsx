import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  RssFeed as FeedIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getPosts, createPost, likePost, commentPost } from '../services/api';
import PostCard from '../components/PostCard';

function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const fetchPosts = async () => {
    try {
      setLoadingFeed(true);
      const data = await getPosts();
      // Ensure the returned data is an array
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setToastSeverity('error');
      setToastMessage('Failed to load feed posts. Please refresh.');
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    // Check if token exists, if not redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchPosts();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setDialogError('');
    setNewPostContent('');
    setNewPostImageUrl('');
  };

  const handleCloseDialog = () => {
    if (!creatingPost) {
      setDialogOpen(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setCreatingPost(true);
    setDialogError('');

    try {
      await createPost(newPostContent, newPostImageUrl);
      setToastSeverity('success');
      setToastMessage('Post created successfully!');
      setDialogOpen(false);
      // Auto-refresh feed
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setDialogError(error.response?.data?.message || error.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const updatedPost = await likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId || post.id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error liking post:', error);
      setToastSeverity('error');
      setToastMessage(error.response?.data?.message || error.response?.data?.error || 'Failed to like post.');
    }
  };

  const handleCommentPost = async (postId, commentText) => {
    try {
      const updatedPost = await commentPost(postId, commentText);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId || post.id === postId ? updatedPost : post))
      );
      setToastSeverity('success');
      setToastMessage('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      setToastSeverity('error');
      setToastMessage(error.response?.data?.message || error.response?.data?.error || 'Failed to post comment.');
      throw error;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pb: 8 }}>
      {/* Navigation Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
        }}
      >
        <Toolbar>
          <FeedIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
            Social Feed
          </Typography>
          <IconButton color="inherit" aria-label="profile" sx={{ mr: 1 }}>
            <AccountIcon />
          </IconButton>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {loadingFeed && posts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to share something with the community!
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenDialog}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4338ca 30%, #db2777 90%)',
                }
              }}
            >
              Create Post
            </Button>
          </Box>
        ) : (
          <Box>
            {posts.map((post) => (
              <PostCard 
                key={post._id || post.id} 
                post={post} 
                onLike={handleLikePost} 
                onComment={handleCommentPost}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="create-post" 
        onClick={handleOpenDialog}
        sx={{ 
          position: 'fixed', 
          bottom: 32, 
          right: 32,
          background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4338ca 30%, #db2777 90%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 2 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Create New Post</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="content"
            label="What's on your mind?"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={creatingPost}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            margin="dense"
            id="imageUrl"
            label="Image URL (optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={newPostImageUrl}
            onChange={(e) => setNewPostImageUrl(e.target.value)}
            disabled={creatingPost}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={creatingPost}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePost} 
            variant="contained" 
            disabled={creatingPost || !newPostContent.trim()}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4338ca 30%, #db2777 90%)',
              }
            }}
          >
            {creatingPost ? <CircularProgress size={24} color="inherit" /> : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global feedback messages */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setToastMessage('')} 
          severity={toastSeverity} 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Feed;
