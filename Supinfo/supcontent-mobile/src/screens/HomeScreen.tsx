import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

export default function HomeScreen() {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const res = await axios.get(`${API_URL}/media/trending`);
            setTrending(res.data.results);
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.poster}
            />
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title || item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Tendances</Text>
            <FlatList
                data={trending}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />

            <Text style={[styles.headerTitle, { marginTop: 20 }]}>Fil d'actualité</Text>
            <View style={styles.feedPlaceholder}>
                <Text style={{ color: '#6b7280' }}>Aucune activité pour le moment</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    list: {
        paddingRight: 20,
    },
    card: {
        marginRight: 15,
        width: 140,
    },
    poster: {
        width: 140,
        height: 210,
        borderRadius: 8,
        marginBottom: 5,
        backgroundColor: '#e5e7eb',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    feedPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 10,
        height: 200
    }
});
