import React, { useState, useEffect } from 'react';
import { Amplify, API } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../AuthContext'; // Use global AuthContext
import awsconfig from '../../aws-exports';
import styles from './Comments.module.css';


Amplify.configure(awsconfig);

// Fetch the comments API endpoint from aws-exports.js
const commentsAPI = awsconfig.aws_cloud_logic_custom.find(api => api.name === 'CommentsAPI')?.endpoint;

const ADMIN_GROUP = 'Admin'; // Cognito group name for admin users

const stripHtmlTags = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const CommentsContent = () => {
  const { user, signOut } = useAuth(); // Use global AuthContext
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postId, setPostId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    if (user) {
      const groups = user?.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
      setIsAdmin(groups.includes(ADMIN_GROUP));
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${commentsAPI}/createTable`);
      const data = await response.json();
      const sortedComments = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(sortedComments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to fetch comments.');
    }
  };

  const postComment = async () => {
    if (!postId || !newComment) {
      toast.error('Post ID and Comment Content are required.');
      return;
    }

    const userEmail = user?.attributes?.email || 'Unknown User';

    const commentData = {
      postId,
      userId: userEmail,
      content: stripHtmlTags(newComment),
      replies: [],
    };

    try {
      const response = await fetch(`${commentsAPI}/createTable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment.');
      }

      toast.success('Comment added successfully!');
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment.');
    }
  };

  const postReply = async (commentId) => {
    const replyText = replyContent[commentId];
    if (!replyText) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    const replyData = {
      userId: user?.attributes?.email || 'Unknown User',
      content: stripHtmlTags(replyText),
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${commentsAPI}/createTable/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        throw new Error('Failed to post reply.');
      }

      toast.success('Reply added successfully!');
      setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
      fetchComments();
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error('Failed to post reply.');
    }
  };

  const deleteComment = async (commentId) => {
    if (!isAdmin) {
      toast.error('Only admin users can delete comments.');
      return;
    }

    try {
      const response = await fetch(`${commentsAPI}/createTable/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment.');
      }

      toast.success('Comment deleted successfully!');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment.');
    }
  };

  const deleteReply = async (commentId, replyIndex) => {
    if (!isAdmin) {
      toast.error('Only admin users can delete replies.');
      return;
    }

    try {
      const response = await fetch(`${commentsAPI}/createTable/${commentId}/reply/${replyIndex}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete reply.');
      }

      toast.success('Reply deleted successfully!');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('Failed to delete reply.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(timestamp));
  };

  if (!user) {
    return <p>Please log in to view and add comments.</p>;
  }

  return (
    <div className={styles.commentsPage}>
      <h2 className={styles.pageTitle}>Comments</h2>
      <div className={styles.commentForm}>
        <label className={styles.formLabel}>
          Post ID:
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="Enter Post ID"
            className={styles.inputField}
          />
        </label>
        <ReactQuill
          value={newComment}
          onChange={setNewComment}
          className={styles.commentEditor}
          placeholder="Write your comment here..."
        />
        <button
          className={styles.addCommentButton}
          onClick={postComment}
        >
          Add Comment
        </button>
      </div>
  
      <div className={styles.commentsList}>
        <h3 className={styles.sectionTitle}>Comments List:</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.commentId} className={styles.commentItem}>
              <p><strong>Post ID:</strong> {comment.postId}</p>
              <p><strong>Content:</strong> {stripHtmlTags(comment.content)}</p>
              <p><strong>User Email:</strong> {comment.userId}</p>
              <p><strong>Timestamp:</strong> {formatTimestamp(comment.timestamp)}</p>
              {isAdmin && (
                <button
                  className={styles.deleteCommentButton}
                  onClick={() => deleteComment(comment.commentId)}
                >
                  Delete Comment
                </button>
              )}
              <div className={styles.replies}>
                {comment.replies && comment.replies.length > 0 ? (
                  comment.replies.map((reply, index) => (
                    <div key={index} className={styles.replyItem}>
                      <p><strong>Reply from {reply.userId}:</strong> {stripHtmlTags(reply.content)}</p>
                      <p><strong>Timestamp:</strong> {formatTimestamp(reply.timestamp)}</p>
                      {isAdmin && (
                        <button
                          className={styles.deleteReplyButton}
                          onClick={() => deleteReply(comment.commentId, index)}
                        >
                          Delete Reply
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No replies yet.</p>
                )}
                <div className={styles.replyForm}>
                  <ReactQuill
                    value={replyContent[comment.commentId] || ''}
                    onChange={(value) =>
                      setReplyContent((prev) => ({ ...prev, [comment.commentId]: value }))
                    }
                    className={styles.replyEditor}
                    placeholder="Write your reply here..."
                  />
                  <button
                    className={styles.addReplyButton}
                    onClick={() => postReply(comment.commentId)}
                  >
                    Add Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </div>
    </div>
  );  
};

const Comments = () => {
  return (
    <div className={styles.commentsPage}>
      <CommentsContent />
    </div>
  );
};

export default Comments;
