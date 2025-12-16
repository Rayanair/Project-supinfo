import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.subtext}>En cours de développement</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 24, fontWeight: 'bold' },
    subtext: { marginTop: 10, color: '#6b7280' }
});

export const SearchScreen = () => <PlaceholderScreen name="Recherche" />;
export const LibraryScreen = () => <PlaceholderScreen name="Bibliothèque" />;
export default PlaceholderScreen;
