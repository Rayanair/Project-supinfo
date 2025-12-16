import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';

export default function Home() {
    const { user } = useAuth();
    const [trending, setTrending] = useState([]);
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/media/trending`);
                setTrending(res.data.results.slice(0, 5));
            } catch (err) { console.error(err) }
        };

        const fetchFeed = async () => {
            if (user) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/social/feed`);
                    setFeed(res.data);
                } catch (err) { console.error(err) }
            }
        };

        fetchTrending();
        fetchFeed();
    }, [user]);

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">Tendances</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {trending.map(media => (
                        <Link to={`/media/${media.media_type}/${media.id}`} key={media.id} className="block group">
                            <div className="aspect-[2/3] bg-gray-200 rounded-md overflow-hidden mb-2 relative">
                                <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={media.title || media.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            </div>
                            <h3 className="font-semibold text-sm truncate">{media.title || media.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Fil d'actualité</h2>
                {user ? (
                    <div className="space-y-4">
                        {feed.length === 0 ? (
                            <div className="p-4 border rounded bg-card text-center text-muted-foreground">
                                Suivez des utilisateurs pour voir leur activité ici.
                            </div>
                        ) : (
                            feed.map(item => (
                                item.type === 'review' ? (
                                    <ReviewCard key={`${item.type}-${item.id}`} review={item} />
                                ) : (
                                    <div key={`${item.type}-${item.id}`} className="p-4 border rounded-lg bg-card">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link to={`/profile/${item.user_id}`}>
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {item.avatar_url ? <img src={item.avatar_url} /> : <div className="w-full h-full bg-primary/20" />}
                                                </div>
                                            </Link>
                                            <div>
                                                <p className="text-sm">
                                                    <Link to={`/profile/${item.user_id}`} className="font-bold hover:underline">{item.username}</Link>
                                                    <span className="text-muted-foreground"> a ajouté à sa liste</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="ml-12">
                                            <p className="text-sm">
                                                a ajouté une œuvre à <span className="font-medium">{item.payload}</span>
                                            </p>
                                            <Link to={`/media/${item.media_type}/${item.tmdb_id}`} className="text-sm text-primary hover:underline">
                                                Voir l'œuvre
                                            </Link>
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-lg text-muted-foreground mb-4">Connectez-vous pour voir l'activité de vos amis.</p>
                        <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
                    </div>
                )}
            </section>
        </div>
    );
}
