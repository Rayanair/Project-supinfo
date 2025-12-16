import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Plus, Loader2, Lock, Globe } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function Library() {
    const { user } = useAuth();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    useEffect(() => {
        fetchLists();
    }, [user]);

    const fetchLists = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/lists`);
            setLists(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createList = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/lists`, {
                name: newListName,
                is_public: isPublic
            });
            setNewListName('');
            setShowCreateModal(false);
            fetchLists();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return <div className="text-center p-10">Veuillez vous connecter.</div>;
    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Ma Bibliothèque</h1>
                <Button onClick={() => setShowCreateModal(!showCreateModal)}>
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle liste
                </Button>
            </div>

            {showCreateModal && (
                <div className="p-4 border rounded bg-card mb-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold mb-2">Créer une liste</h3>
                    <form onSubmit={createList} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm">Nom</label>
                            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} required />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} id="public" />
                            <label htmlFor="public" className="text-sm">Publique</label>
                        </div>
                        <Button type="submit">Créer</Button>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map(list => (
                    <Link to={`/lists/${list.id}`} key={list.id} className="block group">
                        <div className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow">
                            {/* Preview Grid */}
                            <div className="grid grid-cols-2 h-48 bg-gray-100 dark:bg-gray-800">
                                {list.previews && list.previews.length > 0 ? (
                                    list.previews.slice(0, 4).map((poster, i) => (
                                        <img key={i} src={`https://image.tmdb.org/t/p/w200${poster}`} className="w-full h-full object-cover" />
                                    ))
                                ) : (
                                    <div className="col-span-2 flex items-center justify-center text-muted-foreground bg-gray-200 dark:bg-gray-900">
                                        Vide
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{list.name}</h3>
                                    {list.is_public ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{list.item_count} œuvres</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
