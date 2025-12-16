import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trash2, Edit2, X, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';

export default function ListDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', is_public: true });

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/lists/${id}`);
                setList(res.data);
                setEditForm({ name: res.data.name, description: res.data.description, is_public: res.data.is_public });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [id]);

    const handleUpdateList = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/lists/${id}`, editForm);
            setList(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
            alert("Liste mise à jour !");
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteList = async () => {
        if (!confirm("Voulez-vous vraiment supprimer cette liste ? Cette action est irréversible.")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/lists/${id}`);
            alert("Liste supprimée");
            navigate('/library');
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!confirm("Retirer cet élément de la liste ?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/lists/${id}/items/${itemId}`);
            setList(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== itemId)
            }));
        } catch (error) {
            alert("Erreur lors de la suppression de l'élément");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!list) return <div className="text-center p-10">Liste introuvable</div>;

    const isOwner = user && list.user_id === user.id;

    return (
        <div className="space-y-6">
            <div className="border-b pb-4 flex justify-between items-start">
                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-3 max-w-md">
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full text-3xl font-bold bg-background border rounded px-2"
                            />
                            <textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full bg-background border rounded px-2"
                                placeholder="Description..."
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleUpdateList}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-2" /> Annuler</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                {list.name}
                                {!list.is_public && <span className="text-xs bg-muted px-2 py-1 rounded font-normal text-muted-foreground">Privée</span>}
                            </h1>
                            <p className="text-muted-foreground">{list.description || 'Aucune description'}</p>
                        </>
                    )}
                </div>

                {isOwner && !isEditing && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Modifier
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteList}>
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {list.items && list.items.length > 0 ? (
                    list.items.map(item => (
                        <div key={item.id} className="relative group">
                            <MediaCard media={item.media_data} />

                            {/* Badges/Overlays */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded capitalize backdrop-blur-sm">
                                    {item.status}
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Retirer de la liste"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center py-10 text-muted-foreground">Cette liste est vide.</p>
                )}
            </div>
        </div>
    );
}
