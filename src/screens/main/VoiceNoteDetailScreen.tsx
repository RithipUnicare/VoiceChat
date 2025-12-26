import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { RootStackParamList } from '../../types/types';
import { voiceNoteService } from '../../services/voiceNoteService';

type VoiceNoteDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VoiceNoteDetail'>;
  route: RouteProp<RootStackParamList, 'VoiceNoteDetail'>;
};

const VoiceNoteDetailScreen: React.FC<VoiceNoteDetailScreenProps> = ({
  route,
}) => {
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadData();

    return () => {
      // Cleanup audio on unmount
      try {
        Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
      } catch (error) {
        // Ignore errors if nothing is playing
      }
    };
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load transcript
      const text = await voiceNoteService.exportText(id);
      setTranscript(text);

      // Get audio URL from voice notes list
      const notes = await voiceNoteService.listVoiceNotes();
      const note = notes.find(n => n.id === id);
      if (note && note.audioUrl) {
        setAudioUrl(note.audioUrl);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load voice note details.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!audioUrl) {
        Alert.alert('Error', 'Audio URL not available.');
        return;
      }

      if (isPlaying) {
        // Stop playback
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setIsPlaying(false);
      } else {
        // Start playback
        try {
          // Set up playback progress listener
          Sound.addPlayBackListener((e: any) => {
            // Could show progress here if needed
          });

          // Set up playback end listener
          Sound.addPlaybackEndListener(() => {
            setIsPlaying(false);
          });

          await Sound.startPlayer(audioUrl);
          setIsPlaying(true);
        } catch (loadError) {
          console.error('Failed to load or play sound:', loadError);
          Alert.alert('Error', 'Failed to load or play audio file.');
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      Alert.alert('Error', 'Failed to play audio.');
      setIsPlaying(false);
    }
  };

  const handleDownloadAudio = async () => {
    try {
      setDownloading(true);

      // Download audio blob
      const blob = await voiceNoteService.downloadVoiceNote(id);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob as any);

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];

        // Save to file system
        const filename = `voice_note_${id}.m4a`;
        const fileUri = `${RNFS.DocumentDirectoryPath}/${filename}`;

        await RNFS.writeFile(fileUri, base64, 'base64');

        // Share the file
        await Share.open({
          url: `file://${fileUri}`,
          type: 'audio/m4a',
          title: 'Share Voice Note',
        });
      };
    } catch (error) {
      console.error('Failed to download audio:', error);
      Alert.alert('Error', 'Failed to download audio.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);

      // Download PDF blob
      const blob = await voiceNoteService.exportPdf(id);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob as any);

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];

        // Save to file system
        const filename = `voice_note_${id}.pdf`;
        const fileUri = `${RNFS.DocumentDirectoryPath}/${filename}`;

        await RNFS.writeFile(fileUri, base64, 'base64');

        // Share the PDF
        await Share.open({
          url: `file://${fileUri}`,
          type: 'application/pdf',
          title: 'Share Voice Note PDF',
        });
      };
    } catch (error) {
      console.error('Failed to export PDF:', error);
      Alert.alert('Error', 'Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading voice note...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Playback Controls */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Playback
          </Text>

          <View style={styles.playbackControls}>
            <IconButton
              icon={isPlaying ? 'pause-circle' : 'play-circle'}
              size={64}
              iconColor="#6200ee"
              onPress={togglePlayback}
              disabled={!audioUrl}
            />
          </View>

          {!audioUrl && (
            <Text variant="bodySmall" style={styles.noAudioText}>
              Audio not available
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Transcript */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Transcript
          </Text>
          <Text variant="bodyMedium" style={styles.transcriptText}>
            {transcript || 'No transcript available.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Actions
          </Text>

          <Button
            mode="contained"
            icon="download"
            onPress={handleDownloadAudio}
            loading={downloading}
            disabled={downloading || exporting}
            style={styles.actionButton}
          >
            Download Audio
          </Button>

          <Button
            mode="contained"
            icon="file-pdf-box"
            onPress={handleExportPDF}
            loading={exporting}
            disabled={downloading || exporting}
            style={styles.actionButton}
          >
            Export as PDF
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  playbackControls: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noAudioText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
  },
  transcriptText: {
    lineHeight: 24,
    color: '#333',
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default VoiceNoteDetailScreen;
