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
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubble as CommentIcon,
  Send as SendIcon,
} from '@mui/icons-material';

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
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
              fontWeight: 700 
            }}
          >
            {initialLetter}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b' }}>
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
      />
      
      <CardContent sx={{ pt: 1, pb: 2 }}>
        <Typography variant="body1" sx={{ color: '#334155', whiteSpace: 'pre-line' }}>
          {content}
        </Typography>
      </CardContent>

      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="Post attachment"
          sx={{
            maxHeight: 400,
            objectFit: 'cover',
            width: '100%',
            borderTop: '1px solid rgba(0, 0, 0, 0.04)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          }}
        />
      )}

      <CardActions sx={{ px: 2, pb: 1.5, pt: 1, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            aria-label="like post" 
            onClick={() => onLike && onLike(post._id || post.id)}
            sx={{ 
              color: isLiked ? '#ef4444' : 'text.secondary',
              '&:hover': { color: '#ef4444' }
            }}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {likeCount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            aria-label="comments"
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              color: expanded ? '#4f46e5' : 'text.secondary',
              '&:hover': { color: '#4f46e5' }
            }}
          >
            <CommentIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {commentCount}
          </Typography>
        </Box>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* Comments List */}
          <List sx={{ width: '100%', bgcolor: 'background.paper', maxH: 250, overflowY: 'auto', mb: 2 }}>
            {post.comments && post.comments.map((comment, index) => (
              <React.Fragment key={comment._id || index}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      mr: 2, 
                      bgcolor: 'primary.main', 
                      fontSize: '0.875rem',
                      background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)'
                    }}
                  >
                    {(comment.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {comment.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', whiteSpace: 'pre-line' }}>
                        {comment.comment}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < post.comments.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </List>

          {/* Comment Form */}
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              disabled={submitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton 
              type="submit" 
              color="primary" 
              disabled={submitting || !commentInput.trim()}
              sx={{
                background: 'linear-gradient(45deg, #4f46e5 30%, #ec4899 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4338ca 30%, #db2777 90%)',
                },
                '&.Mui-disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8',
                }
              }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}

export default PostCard;
