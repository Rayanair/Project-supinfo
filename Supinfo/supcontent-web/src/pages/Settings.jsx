import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Download, AlertTriangle } from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
    const { user, login } = useAuth(); // login used here to update user context if needed, though a full reload or refetch might be better
    const { theme, setTheme, language, setLanguage, t } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [serverMessage, setServerMessage] = useState({ type: '', text: '' });

    // Profile Form
    const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile } } = useForm({
        defaultValues: {
            username: user?.username || '',
            bio: user?.bio || '',
            avatar_url: user?.avatar_url || ''
        }
    });

    // Password Form
    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: errorsPassword } } = useForm();

    const onSubmitProfile = async (data) => {
        setServerMessage({ type: '', text: '' });
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/users/me`, data);
            setServerMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
            // Ideally refetch user context here
        } catch (error) {
            setServerMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour' });
        }
    };

    const onSubmitPassword = async (data) => {
        setServerMessage({ type: '', text: '' });
        if (data.newPassword !== data.confirmNewPassword) {
            setServerMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
            return;
        }

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/users/me`, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setServerMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
            resetPassword();
        } catch (error) {
            setServerMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la modification' });
        }
    };

    const handleExportData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/export`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `supcontent_export_${user.username}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error(error);
            setServerMessage({ type: 'error', text: 'Erreur lors du téléchargement des données' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('settings.tab.profile')}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'security' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('settings.tab.security')}
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'preferences' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('settings.tab.preferences')}
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'data' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('settings.tab.data')}
                </button>
            </div>

            {/* Server Message Alert */}
            {serverMessage.text && (
                <div className={`p-4 rounded-md ${serverMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {serverMessage.text}
                </div>
            )}

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Avatar URL</label>
                            <Input {...registerProfile('avatar_url')} placeholder="https://..." />
                            <p className="text-xs text-gray-500">Lien vers une image pour votre avatar.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom d'utilisateur</label>
                            <Input {...registerProfile('username', { minLength: { value: 3, message: 'Minimum 3 caractères' } })} />
                            {errorsProfile.username && <span className="text-xs text-red-500">{errorsProfile.username.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <textarea
                                {...registerProfile('bio')}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Parlez-nous de vous..."
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit">
                                <Save className="w-4 h-4 mr-2" />
                                {t('settings.save')}
                            </Button>
                        </div>
                    </form>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                        Si vous vous êtes connecté avec Google, vous n'avez pas de mot de passe à modifier.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mot de passe actuel</label>
                            <Input type="password" {...registerPassword('currentPassword', { required: 'Requis' })} />
                            {errorsPassword.currentPassword && <span className="text-xs text-red-500">{errorsPassword.currentPassword.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nouveau mot de passe</label>
                            <Input type="password" {...registerPassword('newPassword', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })} />
                            {errorsPassword.newPassword && <span className="text-xs text-red-500">{errorsPassword.newPassword.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                            <Input type="password" {...registerPassword('confirmNewPassword', { required: 'Requis' })} />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" variant="destructive">
                                Modifier le mot de passe
                            </Button>
                        </div>
                    </form>
                )}

                {/* PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t('settings.appearance')}</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${theme === 'light' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className="w-full h-20 bg-gray-100 rounded border border-gray-200" />
                                    <span className="font-medium">Clair</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className="w-full h-20 bg-gray-900 rounded border border-gray-800" />
                                    <span className="font-medium">Sombre</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${theme === 'system' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-900 rounded border border-gray-200" />
                                    <span className="font-medium">Système</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-medium">{t('settings.language')}</h3>
                            <select
                                className="w-full md:w-64 p-2 border rounded-md bg-background"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                            </select>
                            <p className="text-sm text-muted-foreground">La langue de l'interface utilisateur.</p>
                        </div>
                    </div>
                )}

                {/* DATA TAB */}
                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Exportation des données (RGPD)</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Vous pouvez télécharger une copie de toutes les données que nous détenons à votre sujet au format JSON.
                                Cela inclut votre profil, vos critiques, vos listes et votre historique.
                            </p>
                            <Button onClick={handleExportData} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger mes données
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
