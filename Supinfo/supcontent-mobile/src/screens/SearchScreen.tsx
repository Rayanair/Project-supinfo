import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
// import { API_URL } from '../config'; // best practice
const API_URL = 'http://localhost:5000/api';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/media/search`, { params: { query } });
            setResults(res.data.results || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        if (item.media_type !== 'movie' && item.media_type !== 'tv') return null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('MediaDetail', { type: item.media_type, id: item.id })}
            >
                <Image
                    source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/100x150' }}
                    style={styles.poster}
                />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title || item.name}</Text>
                    <Text style={styles.date}>{item.release_date || item.first_air_date || 'N/A'}</Text>
                    <Text style={styles.rating}>★ {item.vote_average?.toFixed(1)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <TextInput
                    style={styles.input}
                    placeholder="Rechercher..."
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={query.length > 0 && !loading ? <Text style={styles.empty}>Aucun résultat</Text> : null}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
    searchBox: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    input: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, fontSize: 16 },
    list: { padding: 15 },
    card: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    poster: { width: 80, height: 120, backgroundColor: '#eee' },
    info: { flex: 1, padding: 10, justifyContent: 'center' },
    title: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    date: { color: '#666', fontSize: 12, marginBottom: 5 },
    rating: { color: '#eab308', fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});
