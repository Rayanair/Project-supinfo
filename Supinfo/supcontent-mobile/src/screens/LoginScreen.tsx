import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded for Android Emulator (10.0.2.2 usually) or localhost for iOS simulator
// Ideally use config/env
const API_URL = 'http://localhost:5000/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = res.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            // Configure axios defaults for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            navigation.replace('Main');
        } catch (error) {
            Alert.alert('Erreur', error.response?.data?.message || 'Connexion échouée');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SUPCONTENT</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Info', 'Inscription non implémentée sur mobile pour le MVP')}>
                <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
        color: '#3b82f6',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        textAlign: 'center',
        color: '#3b82f6',
        marginTop: 20,
    }
});
