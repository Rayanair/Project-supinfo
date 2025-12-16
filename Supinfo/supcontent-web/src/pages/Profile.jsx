import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

import { Loader2, User, Users, Calendar, X } from 'lucide-react';
import ReviewCard from '../components/ReviewCard'; // [New Import]

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const [userRes, reviewsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/reviews/user/${id}`)
            ]);
            setProfile({ ...userRes.data, reviews: reviewsRes.data });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [showFollowsModal, setShowFollowsModal] = useState(false);
    const [followsModalType, setFollowsModalType] = useState('followers'); // 'followers' or 'following'
    const [followsList, setFollowsList] = useState([]);

    const openFollowsModal = async (type) => {
        setFollowsModalType(type);
        setShowFollowsModal(true);
        setFollowsList([]); // Clear previous
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}/${type}`);
            setFollowsList(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFollow = async () => {
        try {
            if (profile.is_following) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/social/follow/${id}`);
                setProfile(prev => ({ ...prev, is_following: false, followers_count: prev.followers_count - 1 }));
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/social/follow/${id}`);
                setProfile(prev => ({ ...prev, is_following: true, followers_count: prev.followers_count + 1 }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!profile) return <div className="text-center p-10">Utilisateur introuvable</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-4 border-card shadow-lg">
                    {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-400" />}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{profile.username}</h1>
                        {user && user.id !== profile.id ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={toggleFollow}
                                    variant={profile.is_following ? "outline" : "default"}
                                >
                                    {profile.is_following ? 'Abonné' : 'Suivre'}
                                </Button>
                                <Button
                                    onClick={() => navigate(`/chat/${profile.id}`)}
                                    variant="secondary"
                                >
                                    Message
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => navigate('/chat')}
                                variant="secondary"
                            >
                                Mes Messages
                            </Button>
                        )}
                    </div>

                    <p className="text-muted-foreground max-w-lg">{profile.bio || "Aucune biographie."}</p>

                    <div className="flex gap-6 text-sm">
                        <div
                            className="flex items-center gap-1 cursor-pointer hover:underline"
                            onClick={() => openFollowsModal('followers')}
                        >
                            <Users className="w-4 h-4" />
                            <span className="font-bold">{profile.followers_count}</span> abonnés
                        </div>
                        <div
                            className="flex items-center gap-1 cursor-pointer hover:underline"
                            onClick={() => openFollowsModal('following')}
                        >
                            <Users className="w-4 h-4" />
                            <span className="font-bold">{profile.following_count}</span> abonnements
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Membre depuis {new Date(profile.created_at).getFullYear()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Follows Modal */}
            {showFollowsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/50">
                            <h3 className="font-bold">{followsModalType === 'followers' ? 'Abonnés' : 'Abonnements'}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowFollowsModal(false)}><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-2">
                            {followsList.length > 0 ? (
                                followsList.map(u => (
                                    <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors" onClick={() => { navigate(`/profile/${u.id}`); setShowFollowsModal(false); }}>
                                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2" />}
                                        </div>
                                        <span className="font-medium">{u.username}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center p-4 text-muted-foreground text-sm">Aucun utilisateur.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity or Reviews placeholder */}
            <div className="border-t pt-8">
                <h2 className="text-xl font-bold mb-4">Dernières critiques</h2>
                {profile.reviews && profile.reviews.length > 0 ? (
                    <div className="space-y-4">
                        {profile.reviews.map(review => (
                            <ReviewCard key={review.id} review={review} /> // Using ReviewCard
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Aucune critique récente.</p>
                )}
            </div>
        </div>
    );
}
