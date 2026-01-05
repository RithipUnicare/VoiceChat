import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, FAB, TextInput, Button, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVoice, VoiceMode } from 'react-native-voicekit';
import { RootStackParamList } from '../../types/types';
import { voiceNoteService } from '../../services/voiceNoteService';

type CreateVoiceNoteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateVoiceNote'>;
};

const CreateVoiceNoteScreen: React.FC<CreateVoiceNoteScreenProps> = ({
  navigation,
}) => {
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    available,
    listening,
    transcript: voiceTranscript,
    startListening,
    stopListening,
  } = useVoice({
    locale: 'en-US',
    mode: VoiceMode.Continuous,
    enablePartialResults: true,
  });

  const sentenceSet = useRef<Set<string>>(new Set());
  const accumulatedText = useRef('');
  const lastVoiceTranscript = useRef('');

  useEffect(() => {
    if (voiceTranscript) {
      const isNewSegment =
        !voiceTranscript.startsWith(
          lastVoiceTranscript.current.substring(0, 10),
        ) &&
        lastVoiceTranscript.current.length > 0 &&
        voiceTranscript.length < lastVoiceTranscript.current.length;

      if (isNewSegment) {
        accumulatedText.current =
          accumulatedText.current + ' ' + lastVoiceTranscript.current;
      }

      lastVoiceTranscript.current = voiceTranscript;

      const fullText = (accumulatedText.current + ' ' + voiceTranscript).trim();
      setTranscript(fullText);
    }
  }, [voiceTranscript]);

  useEffect(() => {
    if (!available) {
      Alert.alert(
        'Speech Recognition Unavailable',
        'Speech recognition is not available on this device.',
      );
    }
  }, [available]);

  const handleStartListening = async () => {
    try {
      await startListening();
    } catch (error) {
      Alert.alert('Error', 'Failed to start speech recognition.');
    }
  };

  const handleStopListening = async () => {
    try {
      await stopListening();
    } catch (error) {
      Alert.alert('Error', 'Failed to stop speech recognition.');
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      Alert.alert(
        'Error',
        'Please capture some speech or enter text manually.',
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your voice note.');
      return;
    }

    try {
      setUploading(true);

      const assetSource = require('../../../assets/demoaudio.m4a');
      const asset = Image.resolveAssetSource(assetSource);

      if (!asset) {
        throw new Error('Failed to resolve demo audio asset source');
      }

      const audioFile = {
        uri: asset.uri,
        type: 'audio/m4a',
        name: 'demoaudio.m4a',
      };

      const metadata = {
        title: title.trim(),
        transcriptText: transcript.trim(),
        durationInSeconds: 120,
        language: 'en'
      };

      await voiceNoteService.uploadVoiceNote(
        audioFile,
        metadata,
      );

      Alert.alert('Success', 'Voice note uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        `Failed to upload voice note: ${error.message || 'Please try again.'}`,
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setTitle('');
    sentenceSet.current.clear();
    accumulatedText.current = '';
    lastVoiceTranscript.current = '';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerText}>
            {listening
              ? 'Listening...'
              : available
                ? 'Ready to Listen'
                : 'Not Available'}
          </Text>

          {listening && (
            <View style={styles.listeningIndicator}>
              <Text variant="headlineMedium" style={styles.listeningText}>
                🎤 Listening
              </Text>
            </View>
          )}

          {voiceTranscript && (
            <View style={styles.liveTranscript}>
              <Text variant="bodyMedium">Live: {voiceTranscript}</Text>
            </View>
          )}

          <View style={styles.statsSection}>
            <Text variant="bodySmall" style={styles.statsText}>
              Unique sentences captured: {sentenceSet.current.size}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for this voice note"
            style={styles.input}
          />

          <TextInput
            label="Transcript"
            mode="outlined"
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Transcript will appear here..."
            multiline
            numberOfLines={8}
            style={[styles.input, { height: 150 }]}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.button}
              disabled={uploading}
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={uploading}
              disabled={uploading || !transcript.trim()}
            >
              Submit
            </Button>
          </View>
        </Card.Content>
      </Card>

      {available && (
        <FAB
          icon={listening ? 'stop' : 'microphone'}
          style={[styles.fab, listening && styles.fabListening]}
          onPress={listening ? handleStopListening : handleStartListening}
          label={listening ? 'Stop' : 'Listen'}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  headerText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  listeningIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  listeningText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  liveTranscript: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  statsSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  statsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  fabListening: {
    backgroundColor: '#f44336',
  },
});

export default CreateVoiceNoteScreen;
