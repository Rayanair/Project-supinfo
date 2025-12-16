import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, User } from 'lucide-react';

// Initialize socket outside component to prevent multiple connections
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export default function Chat() {
    const { user } = useAuth();
    const { userId } = useParams(); // Selected user ID from URL
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeUser, setActiveUser] = useState(null);
    const messagesEndRef = useRef(null);

    // Initial load: Fetch conversations & Connect Socket
    useEffect(() => {
        if (!user) return;

        socket.emit('join_user', user.id);

        fetchConversations();

        socket.on('receive_message', (message) => {
            // Include message if it belongs to current active chat
            if (activeUser && (message.sender_id === activeUser.id || message.receiver_id === activeUser.id)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
            // Refresh conversations list to update previews/unread
            fetchConversations();
        });

        return () => {
            socket.off('receive_message');
        };
    }, [user, activeUser]);

    // Fetch message history when userId changes
    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
            // Also need to set active user details, might need to fetch user profile if not in conversations list
            axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`)
                .then(res => setActiveUser(res.data))
                .catch(err => console.error(err));
        } else {
            setActiveUser(null);
            setMessages([]);
        }
    }, [userId]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/conversations`);
            setConversations(res.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/${id}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/${userId}`, { content: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
            scrollToBottom();
            fetchConversations(); // Update preview
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-lg overflow-hidden bg-background">
            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-1/3 border-r bg-card flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="p-4 text-center text-muted-foreground">Aucune conversation.</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => navigate(`/chat/${conv.id}`)}
                                className={`flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors ${parseInt(userId) === conv.id ? 'bg-accent' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                        {conv.avatar_url ? <img src={conv.avatar_url} alt={conv.username} /> : <User className="w-full h-full p-2" />}
                                    </div>
                                    {/* Using !is_read logic might need refinement based on sender */}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{conv.username}</h3>
                                    <p className={`text-sm truncate ${!conv.is_read && conv.sender_id !== user.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                        {conv.sender_id === user.id ? 'Vous: ' : ''}{conv.last_message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col ${!userId ? 'hidden md:flex' : 'flex'}`}>
                {userId && activeUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center gap-3 bg-card sticky top-0 bg-opacity-95 backdrop-blur z-10">
                            <Button variant="ghost" className="md:hidden" onClick={() => navigate('/chat')}>
                                ←
                            </Button>
                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                                {activeUser.avatar_url ? <img src={activeUser.avatar_url} alt={activeUser.username} /> : <User className="w-full h-full p-1" />}
                            </div>
                            <span className="font-bold">{activeUser.username}</span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Écrivez votre message..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <User className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sélectionnez une conversation pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
