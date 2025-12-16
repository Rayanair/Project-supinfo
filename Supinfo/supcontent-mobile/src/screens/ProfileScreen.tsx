import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaceholderScreen from '../components/PlaceholderScreen';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem('user').then(u => {
            if (u) setUser(JSON.parse(u));
        });
    }, []);

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
    };

    if (!user) return <PlaceholderScreen name="Profil" />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 24 }}>{user.username[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.stats}>
                <Text>Statistiques bientôt disponibles</Text>
            </View>

            <Button title="Déconnexion" onPress={logout} color="#ef4444" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#e5e7eb',
        justifyContent: 'center', alignItems: 'center', marginBottom: 15
    },
    username: { fontSize: 24, fontWeight: 'bold' },
    email: { color: '#6b7280' },
    stats: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
