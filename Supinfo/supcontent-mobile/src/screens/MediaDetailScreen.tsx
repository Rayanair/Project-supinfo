import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reuse API_URL logic or move to config
const API_URL = 'http://localhost:5000/api';

export default function MediaDetailScreen() {
    const route = useRoute();
    const { type, id } = route.params;
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [type, id]);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`${API_URL}/media/${type}/${id}`);
            setMedia(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addToLibrary = async (status) => {
        // Simplified logic similar to web
        // In a real app we would check auth first
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                alert('Veuillez vous connecter');
                return;
            }

            const listsRes = await axios.get(`${API_URL}/lists`);
            // Logic to find 'To Watch' or similar... handled on server or basic mapping
            // For now just alert as placeholder for full implementation
            alert(`Ajouté (simulation) : ${status}`);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;
    if (!media) return <View style={styles.center}><Text>Média non trouvé</Text></View>;

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: `https://image.tmdb.org/t/p/original${media.backdrop_path || media.poster_path}` }}
                style={styles.backdrop}
            />
            <View style={styles.content}>
                <Text style={styles.title}>{media.title || media.name}</Text>
                <View style={styles.meta}>
                    <Text style={styles.date}>{media.release_date || media.first_air_date}</Text>
                    <Text style={styles.rating}>★ {media.vote_average?.toFixed(1)}</Text>
                </View>
                <Text style={styles.overview}>{media.overview}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.btn} onPress={() => addToLibrary('planned')}>
                        <Text style={styles.btnText}>À voir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => addToLibrary('completed')}>
                        <Text style={[styles.btnText, styles.textSecondary]}>Vu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backdrop: { width: '100%', height: 250 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
    date: { color: '#666' },
    rating: { color: '#eab308', fontWeight: 'bold' },
    overview: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 20 },
    actions: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
    btnSecondary: { backgroundColor: '#e5e7eb' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    textSecondary: { color: '#333' }
});
