import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

import { Loader2, Star, Plus, Check } from 'lucide-react';
import ReviewCard from '../components/ReviewCard'; // [New Import]

export default function MediaDetail() {
    const { type, id } = useParams();
    const { user } = useAuth();
    const [media, setMedia] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userListStatus, setUserListStatus] = useState(null); // 'planned', 'watching', etc.
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, content: '' });
    const [myLists, setMyLists] = useState([]);
    const [showListDropdown, setShowListDropdown] = useState(false);

    // ... useEffect ...

    const handleSubmitReview = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
                tmdb_id: id,
                media_type: type,
                rating: newReview.rating,
                content: newReview.content
            });
            setShowReviewForm(false);
            setNewReview({ rating: 5, content: '' });
            alert("Critique publiée !");
            // Reload reviews
            const reviewsRes = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/media/${type}/${id}`);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la publication.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [
                    axios.get(`${import.meta.env.VITE_API_URL}/media/${type}/${id}`),
                    axios.get(`${import.meta.env.VITE_API_URL}/reviews/media/${type}/${id}`)
                ];
                if (user) {
                    promises.push(axios.get(`${import.meta.env.VITE_API_URL}/lists`));
                }

                const [mediaRes, reviewsRes, listsRes] = await Promise.all(promises);
                setMedia(mediaRes.data);
                setReviews(reviewsRes.data);
                if (listsRes) {
                    setMyLists(listsRes.data);
                }
            } catch (error) {
                console.error("Error fetching details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, id, user]);

    const addToLibrary = async (status) => {
        try {
            const listsRes = await axios.get(`${import.meta.env.VITE_API_URL}/lists`);
            const lists = listsRes.data;

            // Mapping status to typical list names
            const statusMap = {
                'planned': 'To Watch',
                'watching': 'Watching',
                'completed': 'Completed',
                'dropped': 'Dropped'
            };

            const targetListName = statusMap[status];
            let targetList = lists.find(l => l.name === targetListName);

            if (!targetList) {
                const createRes = await axios.post(`${import.meta.env.VITE_API_URL}/lists`, { name: targetListName, is_system: true });
                targetList = { id: createRes.data.id };
            }

            await addToList(targetList.id, targetListName);
            setUserListStatus(status);
        } catch (error) {
            console.error("Error adding to library", error);
            alert("Erreur lors de l'ajout");
        }
    };

    const addToList = async (listId, listName) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/lists/${listId}/items`, {
                tmdb_id: media.id,
                media_type: type,
                status: 'planned' // Default status when adding to custom list
            });
            alert(`Ajouté à ${listName}`);
            setShowListDropdown(false);
        } catch (error) {
            console.error("Error adding to list", error);
            alert("Erreur lors de l'ajout à la liste");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!media) return <div className="text-center p-20">Contenu non trouvé</div>;

    const backdropUrl = media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null;
    const posterUrl = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-900 text-white">
                {backdropUrl && (
                    <div className="absolute inset-0 opacity-40">
                        <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-8 z-10">
                    <div className="w-48 flex-shrink-0 mx-auto md:mx-0">
                        {posterUrl && <img src={posterUrl} alt={media.title || media.name} className="w-full rounded-lg shadow-md" />}
                    </div>
                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold">{media.title || media.name}</h1>
                        <div className="flex items-center gap-4 text-sm md:text-base text-gray-300">
                            <span>{media.release_date || media.first_air_date}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{media.vote_average?.toFixed(1)}</span>
                            </div>
                        </div>
                        <p className="text-gray-200 max-w-2xl">{media.overview}</p>

                        {user && (
                            <div className="pt-4 flex gap-3">
                                <Button onClick={() => addToLibrary('planned')}><Plus className="w-4 h-4 mr-2" /> À voir</Button>
                                <Button variant="secondary" onClick={() => addToLibrary('completed')}><Check className="w-4 h-4 mr-2" /> Vu</Button>

                                <div className="relative">
                                    <Button variant="outline" className="bg-transparent/20 border-white/20 hover:bg-white/20 text-white" onClick={() => setShowListDropdown(!showListDropdown)}>
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter à une liste
                                    </Button>

                                    {showListDropdown && (
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-card border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="p-2 border-b bg-muted/50">
                                                <p className="text-xs font-medium text-muted-foreground">Vos listes</p>
                                            </div>
                                            <div className="py-1 max-h-60 overflow-y-auto text-foreground">
                                                {myLists.length > 0 ? (
                                                    myLists.map(list => (
                                                        <button
                                                            key={list.id}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                                                            onClick={() => addToList(list.id, list.name)}
                                                        >
                                                            <span className="truncate">{list.name}</span>
                                                            {list.is_public && <span className="text-[10px] bg-secondary px-1 rounded text-secondary-foreground">Public</span>}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-2 text-sm text-muted-foreground">Aucune liste créée.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Critiques</h2>
                        {user && !showReviewForm && (
                            <Button variant="outline" onClick={() => setShowReviewForm(true)}>Écrire une critique</Button>
                        )}
                    </div>

                    {showReviewForm && (
                        <div className="bg-card p-6 border rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-semibold">Nouvelle critique</h3>
                            <div className="flex items-center gap-1">
                                <span className="text-sm mr-2">Note :</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                    />
                                ))}
                            </div>
                            <textarea
                                className="w-full p-3 rounded-md bg-background border min-h-[100px]"
                                placeholder="Partagez votre avis..."
                                value={newReview.content}
                                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                                <Button onClick={handleSubmitReview}>Publier</Button>
                            </div>
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Aucune critique pour le moment. Soyez le premier !</p>
                    )}
                </div>

                {/* Sidebar / Recommendations */}
                <div className="space-y-6">
                    <h3 className="font-bold text-lg">Similaires</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {media.similar?.results?.slice(0, 4).map(item => (
                            <Link to={`/media/${type}/${item.id}`} key={item.id} className="block">
                                <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden">
                                    {item.poster_path && <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} className="w-full h-full object-cover" />}
                                </div>
                                <p className="text-xs mt-1 truncate font-medium">{item.title || item.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
