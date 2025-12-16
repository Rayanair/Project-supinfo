import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle, XCircle, Ban, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    // Simple state for tabs: 'dashboard' | 'users' | 'reviews' | 'reports'
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, reportsRes, usersRes, reviewsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/reports`),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/users`),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/reviews`)
            ]);
            setStats(statsRes.data);
            setReports(reportsRes.data);
            setUsersList(usersRes.data);
            setReviewsList(reviewsRes.data);
        } catch (error) {
            console.error(error);
            alert("Impossible de charger les données admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/reports/${id}`, { status: 'resolved' });
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
            // alert("Signalement résolu.");
        } catch (error) {
            alert("Erreur lors de la mise à jour.");
        }
    };

    const handleBan = async (userId) => {
        if (!confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/ban`);
            alert("Utilisateur banni.");
            fetchData(); // Refresh data
        } catch (error) {
            alert("Erreur lors du bannissement.");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Administration</h1>

            {/* Custom Tabs List */}
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Utilisateurs
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Critiques
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'reports' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('reports')}
                >
                    Signalements
                </button>
            </div>

            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            onClick={() => setActiveTab('users')}
                            className="bg-card p-6 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-lg font-medium text-muted-foreground">Utilisateurs</h3>
                            <p className="text-4xl font-bold mt-2">{stats?.usersCount}</p>
                        </div>
                        <div
                            onClick={() => setActiveTab('reviews')}
                            className="bg-card p-6 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-lg font-medium text-muted-foreground">Critiques</h3>
                            <p className="text-4xl font-bold mt-2">{stats?.reviewsCount}</p>
                        </div>
                        <div
                            onClick={() => setActiveTab('reports')}
                            className="bg-card p-6 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-lg font-medium text-muted-foreground">Signalements en attente</h3>
                            <p className="text-4xl font-bold mt-2 text-orange-500">{stats?.reportsCount}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab Content */}
            {activeTab === 'users' && (
                <div className="bg-card rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Gestion des Utilisateurs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Utilisateur</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Inscription</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {usersList.map(user => (
                                    <tr key={user.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">#{user.id}</td>
                                        <td className="px-6 py-4 font-medium">{user.username}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="destructive" size="sm" onClick={() => handleBan(user.id)}>
                                                <Ban className="w-4 h-4 mr-2" /> Bannir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'reviews' && (
                <div className="bg-card rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Gestion des Critiques</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Auteur</th>
                                    <th className="px-6 py-3">Contenu</th>
                                    <th className="px-6 py-3">Note</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reviewsList.map(review => (
                                    <tr key={review.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">#{review.id}</td>
                                        <td className="px-6 py-4 font-medium">{review.author_name}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{review.content}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${review.rating >= 7 ? 'bg-green-100 text-green-800' : review.rating >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {review.rating}/10
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(review.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/media/${review.media_type}/${review.tmdb_id}`)}>
                                                Voir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reports Tab Content */}
            {activeTab === 'reports' && (
                <div className="bg-card rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Gestion des Signalements
                        </h2>
                    </div>
                    <div className="divide-y">
                        {reports.length === 0 ? (
                            <p className="p-6 text-center text-muted-foreground">Aucun signalement.</p>
                        ) : (
                            reports.map(report => (
                                <div key={report.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {report.status.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="font-medium">Type: {report.target_type} #{report.target_id}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Raison: {report.reason}</p>
                                        <p className="text-sm text-muted-foreground">Signalé par: {report.reporter_name}</p>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleResolve(report.id)}>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Résoudre
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleBan(report.reporter_id)}>
                                                <Ban className="w-4 h-4 mr-2" />
                                                Bannir (Reporter)
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
