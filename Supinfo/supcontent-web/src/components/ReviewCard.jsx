import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Star, Heart, MessageCircle, Send, Flag, Trash2, Edit2, Check, X } from 'lucide-react';

export default function ReviewCard({ review }) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(review.is_liked);
    const [likesCount, setLikesCount] = useState(review.likes_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsCount, setCommentsCount] = useState(review.comments_count || 0);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.content);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleLike = async () => {
        // ... existing like logic ...
        if (!user) return alert("Connectez-vous pour aimer.");
        const previousLiked = isLiked;
        const previousCount = likesCount;
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            if (previousLiked) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${review.id}/like`);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/reviews/${review.id}/like`);
            }
        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            console.error(error);
        }
    };

    // ... existing comment logic ...
    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${review.id}/comments`);
                setComments(res.data);
            } catch (error) { console.error(error); } finally { setLoadingComments(false); }
        }
        setShowComments(!showComments);
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reviews/${review.id}/comments`, { content: newComment });
            setNewComment('');
            setComments([...comments, { id: Date.now(), username: user.username, avatar_url: user.avatar_url, content: newComment, created_at: new Date().toISOString() }]);
            setCommentsCount(prev => prev + 1);
        } catch (error) { console.error(error); alert("Erreur lors de l'envoi"); }
    };

    // Edit & Delete logic
    const handleUpdate = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/reviews/${review.id}`, { content: editContent });
            setIsEditing(false);
            review.content = editContent; // Optimistic update
        } catch (error) {
            alert("Erreur lors de la modification");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Supprimer votre critique ?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${review.id}`);
            setIsDeleted(true);
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const [isHighlighted, setIsHighlighted] = useState(review.is_highlighted);
    const handleReport = async () => {
        const reason = prompt("Raison du signalement :");
        if (!reason) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reports`, { target_type: 'review', target_id: review.id, reason });
            alert("Signalé.");
        } catch (error) { alert("Erreur."); }
    };
    const handleHighlight = async () => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/reviews/${review.id}/highlight`);
            setIsHighlighted(res.data.is_highlighted);
        } catch (error) { alert("Erreur."); }
    };

    if (isDeleted) return null;

    const isOwner = user && user.id === review.user_id;

    return (
        <div className={`p-4 border rounded-lg bg-card transition-all ${isHighlighted ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : ''}`}>
            {isHighlighted && <div className="mb-2 text-xs font-bold text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Coup de cœur de la modération</div>}

            <div className="flex items-center gap-3 mb-3">
                <Link to={`/profile/${review.user_id}`}>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {review.avatar_url ? <img src={review.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20" />}
                    </div>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link to={`/profile/${review.user_id}`} className="font-semibold text-sm hover:underline">{review.username}</Link>
                        <span className="text-xs text-muted-foreground">• {new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.rating && (
                        <div className="flex text-yellow-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {user && user.role === 'admin' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500" onClick={handleHighlight}><Star className={`w-4 h-4 ${isHighlighted ? 'fill-current' : ''}`} /></Button>
                    )}
                    {isOwner && !isEditing && (
                        <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    {user && !isOwner && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleReport}><Flag className="w-4 h-4" /></Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-2 mb-4">
                    <textarea
                        className="w-full p-2 rounded border bg-background text-sm min-h-[80px]"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                        <Button size="sm" onClick={handleUpdate}>Enregistrer</Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm mb-4 leading-relaxed">{review.content || review.payload}</p>
            )}

            <div className="flex items-center gap-4 border-t pt-3">
                <Button variant="ghost" size="sm" className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`} onClick={handleLike}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={toggleComments}>
                    <MessageCircle className="w-4 h-4" />
                    <span>{commentsCount}</span>
                </Button>
            </div>

            {showComments && (
                <div className="mt-4 space-y-4 pl-4 border-l-2">
                    {loadingComments && <p className="text-xs text-muted-foreground">Chargement...</p>}

                    {comments.map((comment, idx) => (
                        <div key={comment.id || idx} className="text-sm">
                            <span className="font-bold mr-2">{comment.username}</span>
                            <span className="text-foreground/90">{comment.content}</span>
                        </div>
                    ))}

                    {user && (
                        <form onSubmit={handlePostComment} className="flex gap-2 items-center mt-2">
                            <input
                                className="flex-1 bg-background border rounded px-3 py-2 text-sm"
                                placeholder="Ajouter un commentaire..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <Button size="icon" type="submit" variant="ghost">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
