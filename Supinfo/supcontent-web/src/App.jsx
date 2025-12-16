import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // [New Import]
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MediaDetail from './pages/MediaDetail';
import Settings from './pages/Settings';
import Chat from './pages/Chat'; // [New Import]
import Admin from './pages/Admin'; // [New Import]
import AdminRoute from './components/AdminRoute'; // [New Import]

import Library from './pages/Library';
import ListDetail from './pages/ListDetail';
import Profile from './pages/Profile';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/media/:type/:id" element={<MediaDetail />} />
                            <Route path="/library" element={<Library />} />
                            <Route path="/lists/:id" element={<ListDetail />} />
                            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                            <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} /> {/* [New Route] */}
                            {/* Future routes will go here */}
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
