import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../aws-exports';
import './Comments.css';

Amplify.configure(awsconfig);

const API_URL = 'https://uss6ririzj.execute-api.us-east-1.amazonaws.com/prd';
const ADMIN_EMAIL = 'hectormestre1234@gmail.com';

const stripHtmlTags = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const CommentsContent = ({ user, signOut }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postId, setPostId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    const email = user?.signInDetails?.loginId;
    setIsAdmin(email === ADMIN_EMAIL);
  }, [user]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/createTable`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      let data = await response.json();
      data = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(data || []);
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

    const userEmail = user?.signInDetails?.loginId || 'Unknown User';

    const commentData = {
      postId,
      userId: userEmail,
      content: stripHtmlTags(newComment),
      replies: [],
    };

    try {
      const response = await fetch(`${API_URL}/createTable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
      userId: user?.signInDetails?.loginId || 'Unknown User',
      content: stripHtmlTags(replyText),
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/createTable/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
      const response = await fetch(`${API_URL}/createTable/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Comment deleted successfully!');
        fetchComments();
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
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
      const response = await fetch(`${API_URL}/createTable/${commentId}/reply/${replyIndex}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Reply deleted successfully!');
        fetchComments();
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
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

  return (
    <div className="comments-container">
      <h2>Comments</h2>
      <button onClick={signOut}>Sign Out</button>
      <div className="comment-form">
        <label>
          Post ID:
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="Enter Post ID"
          />
        </label>
        <ReactQuill
          value={newComment}
          onChange={setNewComment}
          placeholder="Write your comment here..."
        />
        <button onClick={postComment}>Add Comment</button>
      </div>
      <div className="comments-list">
        <h3>Comments List:</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.commentId} className="comment-item">
              <p><strong>Post ID:</strong> {comment.postId}</p>
              <p><strong>Content:</strong> {stripHtmlTags(comment.content)}</p>
              <p><strong>User Email:</strong> {comment.userId}</p>
              <p><strong>Timestamp:</strong> {formatTimestamp(comment.timestamp)}</p>
              {isAdmin && (
                <button onClick={() => deleteComment(comment.commentId)}>Delete Comment</button>
              )}
              <div className="replies">
                {comment.replies && comment.replies.map((reply, index) => (
                  <div key={index} className="reply-item">
                    <p><strong>Reply from {reply.userId}:</strong> {stripHtmlTags(reply.content)}</p>
                    <p><strong>Timestamp:</strong> {formatTimestamp(reply.timestamp)}</p>
                    {isAdmin && (
                      <button onClick={() => deleteReply(comment.commentId, index)}>Delete Reply</button>
                    )}
                  </div>
                ))}
                <div className="reply-form">
                  <ReactQuill
                    value={replyContent[comment.commentId] || ''}
                    onChange={(value) => setReplyContent((prev) => ({ ...prev, [comment.commentId]: value }))}
                    placeholder="Write your reply here..."
                  />
                  <button onClick={() => postReply(comment.commentId)}>Add Reply</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

const Comments = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <CommentsContent user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
};

export default Comments;
