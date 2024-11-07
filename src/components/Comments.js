import React, { useState, useEffect } from 'react';
import awsconfig from '../aws-exports';  // Adjust the path if needed

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const API_URL = awsconfig.aws_cloud_logic_custom.find(api => api.name === "CommentsAPI").endpoint;

    // Fetch all comments from the API
    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_URL}/createTable`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    // Post a new comment to the API
    const postComment = async () => {
        if (!newComment) return;

        const commentData = {
            postId: 'home-page',
            userId: 'user1',
            content: newComment,
        };

        try {
            const response = await fetch(`${API_URL}/createTable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNewComment('');
            fetchComments(); // Refresh comments after posting
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    return (
        <div>
            <h2>Comments</h2>
            <div>
                {comments.map((comment) => (
                    <div key={comment.commentId}>
                        <p>{comment.content}</p>
                        <small>{comment.timestamp}</small>
                        <button onClick={() => deleteComment(comment.commentId)}>Delete</button>
                    </div>
                ))}
            </div>
            <div>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button onClick={postComment}>Post Comment</button>
            </div>
        </div>
    );
};

export default Comments;
