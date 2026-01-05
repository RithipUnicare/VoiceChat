import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
} from 'react-native';
import { Card, Text, FAB, IconButton, Searchbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, VoiceNoteSummaryResponse } from '../../types/types';
import { voiceNoteService } from '../../services/voiceNoteService';



type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [voiceNotes, setVoiceNotes] = useState<VoiceNoteSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        navigation.addListener('focus', () => loadVoiceNotes());

        // Add header buttons
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                    icon="account-circle"
                    size={24}
                    iconColor="#fff"
                    onPress={() => navigation.navigate('Profile')}
                />
            ),
        });
    }, [navigation]);

    const loadVoiceNotes = async () => {
        try {
            setLoading(true);
            const notes = await voiceNoteService.listVoiceNotes();
            setVoiceNotes(notes);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load voice notes');
            console.error('Failed to load voice notes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadVoiceNotes();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderVoiceNote = ({ item }: { item: VoiceNoteSummaryResponse }) => (
        <Card style={styles.noteCard} onPress={() => navigation.navigate('VoiceNoteDetail', { id: item.id })}>
            <Card.Content style={styles.noteHeader}>
                <View style={styles.iconContainer}>
                    <IconButton icon="microphone" size={24} iconColor="#6200ee" />
                </View>
                <View style={styles.noteInfo}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.noteTitle}>
                        {item.title}
                    </Text>
                    <View style={styles.noteMetadata}>
                        <Text variant="bodySmall" style={styles.metadataText}>{formatDate(item.createdAt)}</Text>
                        <Text style={styles.metadataDot}>•</Text>
                        <Text variant="bodySmall" style={styles.metadataText}>{formatDuration(item.durationInSeconds)}</Text>
                        <Text style={styles.metadataDot}>•</Text>
                        <Text variant="bodySmall" style={styles.metadataText}>{item.language}</Text>
                    </View>
                </View>
                <IconButton icon="chevron-right" size={24} iconColor="#999" />
            </Card.Content>
        </Card>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconButton icon="microphone-outline" size={80} iconColor="#ccc" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>No Voice Notes Yet</Text>
            <Text style={styles.emptySubtitle}>
                Tap the + button to create your first voice note
            </Text>
        </View>
    );

    // Filter voice notes based on search query
    const filteredVoiceNotes = voiceNotes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search by title..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />
            <FlatList
                data={filteredVoiceNotes}

                renderItem={renderVoiceNote}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    voiceNotes.length === 0 && styles.emptyList,
                ]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={!loading ? renderEmptyState : null}
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('CreateVoiceNote')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchBar: {
        margin: 16,
        marginBottom: 8,
        elevation: 0,
    },
    listContent: {

        padding: 16,
    },
    emptyList: {
        flexGrow: 1,
    },
    noteCard: {
        marginBottom: 12,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0e6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    noteInfo: {
        flex: 1,
    },
    noteTitle: {
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    noteMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metadataText: {
        color: '#666',
    },
    metadataDot: {
        marginHorizontal: 6,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default HomeScreen;

