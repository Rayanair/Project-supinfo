import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Bell, Menu, User, Mail, Check } from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const { t } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <nav className="border-b bg-card transition-colors duration-300 relative z-50">
                <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                    <Link to="/" className="text-2xl font-bold text-primary">SupContent</Link>

                    <div className="hidden md:flex items-center gap-6 ml-6 mr-auto text-sm font-medium">
                        <Link to="/library" className="hover:text-primary/80 transition-colors">{t('nav.library')}</Link>
                    </div>

                    <form onSubmit={handleSearch} className="hidden md:flex relative w-1/3">
                        <Input
                            type="text"
                            placeholder={t('search.placeholder')}
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button size="icon" variant="ghost" className="absolute right-0 top-0 text-muted-foreground w-10">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/chat">
                                    <Button variant="ghost" size="icon">
                                        <Mail className="w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="relative" ref={notificationRef}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative"
                                        onClick={() => setShowNotifications(!showNotifications)}
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                    </Button>

                                    {showNotifications && (
                                        <div className="absolute top-full right-0 mt-2 w-80 bg-card border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="p-3 border-b flex justify-between items-center bg-muted/50">
                                                <span className="text-sm font-semibold">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                                        Tout marquer lu
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif.id}
                                                            className={`p-3 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                        >
                                                            <p className={`${!notif.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
                                                                {notif.type === 'like' && `❤️ ${notif.title || 'Quelqu\'un a aimé votre contenu'}`}
                                                                {notif.type === 'comment' && `💬 ${notif.title || 'Nouveau commentaire'}`}
                                                                {notif.type === 'follow' && `👤 ${notif.title || 'Nouvel abonné'}`}
                                                                {!['like', 'comment', 'follow'].includes(notif.type) && (notif.title || notif.message)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1 truncate">{notif.message}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                                        Aucune notification
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link to={`/profile/${user.id}`}>
                                        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                                            {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : <User className="w-full h-full p-1" />}
                                        </div>
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin">
                                            <Button variant="ghost" size="sm" className="text-red-500 font-bold">Admin</Button>
                                        </Link>
                                    )}
                                    <Link to="/settings">
                                        <Button variant="ghost" size="sm">{t('nav.settings')}</Button>
                                    </Link>
                                    <Button variant="ghost" onClick={logout}>{t('nav.logout')}</Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login"><Button variant="ghost">{t('nav.login')}</Button></Link>
                                <Link to="/register"><Button>{t('nav.register')}</Button></Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav >
            <main className="container px-4 py-8 mx-auto">
                <Outlet />
            </main>
        </div >
    );
}
