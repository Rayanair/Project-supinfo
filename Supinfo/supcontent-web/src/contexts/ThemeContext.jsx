import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'fr';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const translations = {
        fr: {
            'nav.library': 'Ma Bibliothèque',
            'nav.login': 'Connexion',
            'nav.register': 'Inscription',
            'nav.settings': 'Paramètres',
            'nav.logout': 'Déconnexion',
            'settings.title': 'Paramètres',
            'settings.tab.profile': 'Profil',
            'settings.tab.security': 'Sécurité',
            'settings.tab.preferences': 'Préférences',
            'settings.tab.data': 'Données',
            'settings.appearance': 'Apparence',
            'settings.language': 'Langue',
            'settings.save': 'Enregistrer',
            'search.placeholder': 'Rechercher...'
        },
        en: {
            'nav.library': 'My Library',
            'nav.login': 'Login',
            'nav.register': 'Register',
            'nav.settings': 'Settings',
            'nav.logout': 'Logout',
            'settings.title': 'Settings',
            'settings.tab.profile': 'Profile',
            'settings.tab.security': 'Security',
            'settings.tab.preferences': 'Preferences',
            'settings.tab.data': 'Data',
            'settings.appearance': 'Appearance',
            'settings.language': 'Language',
            'settings.save': 'Save Changes',
            'search.placeholder': 'Search...'
        },
        es: {
            'nav.library': 'Mi Biblioteca',
            'nav.login': 'Iniciar Sesión',
            'nav.register': 'Registrarse',
            'nav.settings': 'Configuración',
            'nav.logout': 'Cerrar Sesión',
            'settings.title': 'Configuración',
            'settings.tab.profile': 'Perfil',
            'settings.tab.security': 'Seguridad',
            'settings.tab.preferences': 'Preferencias',
            'settings.tab.data': 'Datos',
            'settings.appearance': 'Apariencia',
            'settings.language': 'Idioma',
            'settings.save': 'Guardar Cambios',
            'search.placeholder': 'Buscar...'
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
