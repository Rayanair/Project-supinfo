import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

export default function LibraryScreen() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        // Ideally use useFocusEffect to refresh when tab is focused
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/lists`);
            setLists(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.grid}>
                {item.previews && item.previews.slice(0, 4).map((url, i) => (
                    <View key={i} style={styles.previewBox} /> // Placeholder for images due to time, implement real images if needed
                ))}
                {(!item.previews || item.previews.length === 0) && <Text style={styles.emptyText}>Vide</Text>}
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.item_count} éléments</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Ma Bibliothèque</Text>
            <FlatList
                data={lists}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15 },
    list: { paddingHorizontal: 20 },
    card: { marginBottom: 20, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    grid: { height: 120, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f3f4f6' },
    previewBox: { width: '50%', height: '50%', borderWidth: 0.5, borderColor: '#fff', backgroundColor: '#ddd' },
    emptyText: { width: '100%', textAlign: 'center', lineHeight: 120, color: '#999' },
    info: { padding: 15 },
    name: { fontSize: 16, fontWeight: 'bold' },
    count: { color: '#666', marginTop: 5 }
});
