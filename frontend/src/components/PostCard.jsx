import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Collapse,
  Divider,
  TextField,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Send as SendIcon,
} from '@mui/icons-material';

import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

function PostCard({ post, onLike, onComment }) {
  const [expanded, setExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post._id || post.id, commentInput);
      setCommentInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const username = post.user?.username || post.username || post.author?.username || 'Anonymous';
  const content = post.content || post.text || '';
  const imageUrl = post.imageUrl || post.image || '';
  
  const likeCount = Array.isArray(post.likes) 
    ? post.likes.length 
    : (typeof post.likes === 'number' ? post.likes : (post.likeCount || 0));
    
  const commentCount = Array.isArray(post.comments) 
    ? post.comments.length 
    : (typeof post.comments === 'number' ? post.comments : (post.commentCount || 0));

  const initialLetter = username.charAt(0).toUpperCase();

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const currentUserId = currentUser?.id || currentUser?._id;

  const isLiked = Array.isArray(post.likes) && post.likes.some(
    (like) => {
      const likeUserId = like.userId?.toString() || like.toString();
      return likeUserId === currentUserId;
    }
  );

  const formattedDate = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 2, 
        borderRadius: 2, 
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #0a66c2 0%, #1e3c72 100%)',
              fontWeight: 600,
              fontSize: '1rem',
              width: 48,
              height: 48,
            }}
          >
            {initialLetter}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#0f172a' }}>
            {username}
          </Typography>
        }
        subheader={
          formattedDate && (
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          )
        }
        sx={{ pb: 1.5 }}
      />
      
      <CardContent sx={{ pt: 0, pb: 1.5, px: 2 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#1e293b', 
            lineHeight: 1.6, 
            fontSize: '0.95rem',
            whiteSpace: 'pre-line' 
          }}
        >
          {content}
        </Typography>
      </CardContent>

      {imageUrl && (
        <Box sx={{ px: 2, pb: 2 }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Post attachment"
            sx={{
              maxHeight: 450,
              objectFit: 'cover',
              width: '100%',
              borderRadius: 1.5,
              border: '1px solid #f1f5f9',
            }}
          />
        </Box>
      )}

      {/* Social Statistics Row */}
      {(likeCount > 0 || commentCount > 0) && (
        <Box sx={{ px: 2, pb: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'Like' : 'Likes'}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}` : ''}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mx: 2 }} />

      {/* Action Buttons Row */}
      <CardActions disableSpacing sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'space-around' }}>
        <Button
          fullWidth
          startIcon={isLiked ? <FavoriteIcon sx={{ color: '#ef4444' }} /> : <FavoriteBorderIcon />}
          onClick={() => onLike && onLike(post._id || post.id)}
          sx={{
            textTransform: 'none',
            color: isLiked ? '#ef4444' : '#64748b',
            fontWeight: 600,
            py: 1,
            '&:hover': {
              backgroundColor: '#f8fafc',
            }
          }}
        >
          Like
        </Button>
        <Button
          fullWidth
          startIcon={<ChatOutlinedIcon />}
          onClick={() => setExpanded(!expanded)}
          sx={{
            textTransform: 'none',
            color: expanded ? '#0a66c2' : '#64748b',
            fontWeight: 600,
            py: 1,
            '&:hover': {
              backgroundColor: '#f8fafc',
            }
          }}
        >
          Comment
        </Button>
      </CardActions>

      {/* Collapsible Comments Section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2, backgroundColor: '#f8fafc' }}>
          {/* Comment Input */}
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#0a66c2',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              disabled={submitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                },
              }}
            />
            <IconButton 
              type="submit" 
              color="primary" 
              disabled={submitting || !commentInput.trim()}
              sx={{
                color: '#0a66c2',
                '&:hover': {
                  backgroundColor: 'rgba(10, 102, 194, 0.05)',
                }
              }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>

          {/* Comments List */}
          <Stack spacing={1.5}>
            {post.comments && post.comments.map((comment, index) => (
              <Box key={comment._id || index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#e2e8f0', 
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {(comment.username || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box 
                  sx={{ 
                    bgcolor: '#f1f5f9', 
                    borderRadius: 3, 
                    py: 1, 
                    px: 1.5, 
                    flexGrow: 1, 
                    maxWidth: 'calc(100% - 48px)' 
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                    {comment.username}
                  </Typography>
                  <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', mt: 0.5, lineHeight: 1.5 }}>
                    {comment.comment}
                  </Typography>
                </Box>
              </Box>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                No comments yet.
              </Typography>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
}

export default PostCard;
