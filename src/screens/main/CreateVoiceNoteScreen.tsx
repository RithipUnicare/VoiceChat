import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  TextInput,
  Button,
  Card,
  IconButton,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVoice, VoiceMode } from 'react-native-voicekit';
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';
import { RootStackParamList } from '../../types/types';

type CreateVoiceNoteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateVoiceNote'>;
};

const CreateVoiceNoteScreen: React.FC<CreateVoiceNoteScreenProps> = ({
  navigation,
}) => {
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingUri, setRecordingUri] = useState('');
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Initialize voice recognition hook
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

  // Track previous transcript to detect changes
  const previousTranscript = React.useRef('');

  // Sync voice transcript to local state - APPEND instead of replace
  useEffect(() => {
    if (voiceTranscript && voiceTranscript !== previousTranscript.current) {
      // Append new text to existing transcript
      setTranscript(prev => {
        const newText = prev ? `${prev} ${voiceTranscript}` : voiceTranscript;
        return newText;
      });
      previousTranscript.current = voiceTranscript;
      console.log('✅ Voice transcript appended:', voiceTranscript);
    }
  }, [voiceTranscript]);

  // Check voice availability
  useEffect(() => {
    console.log('🔊 Voice recognition available:', available);
    if (!available) {
      Alert.alert(
        'Speech Recognition Unavailable',
        'Speech recognition is not available on this device.',
      );
    }
  }, [available]);

  const handleStartListening = async () => {
    try {
      // Create audio file path
      const fileName = `recording_${Date.now()}.m4a`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Set up recording progress listener
      Sound.addRecordBackListener((e: any) => {
        setDuration(Math.floor(e.currentPosition / 1000));
      });

      // Start audio recording
      await Sound.startRecorder(filePath);

      // Start voice recognition
      await startListening();
      setIsListening(true);
      console.log('🎤 Started listening + recording');
    } catch (error) {
      console.error('Failed to start:', error);
      Alert.alert('Error', 'Failed to start recording and speech recognition.');
    }
  };

  const handleStopListening = async () => {
    try {
      // Stop voice recognition
      await stopListening();

      // Stop audio recording
      const uri = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      if (uri) {
        setRecordingUri(uri);
        console.log('📁 Recording saved:', uri);
      }

      setIsListening(false);
      console.log('🛑 Stopped listening + recording');
      console.log('📝 Final transcript:', voiceTranscript);
    } catch (error) {
      console.error('Failed to stop:', error);
      Alert.alert('Error', 'Failed to stop recording and speech recognition.');
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      if (isPlaying) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        setIsPlaying(false);
      } else {
        Sound.addPlayBackListener((e: any) => {
          if (e.currentPosition === e.duration && e.duration > 0) {
            setIsPlaying(false);
          }
        });

        await Sound.startPlayer(recordingUri);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!transcript.trim()) {
      Alert.alert('Error', 'Please capture some speech or enter text manually.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your voice note.');
      return;
    }

    Alert.alert(
      'Upload Text Only',
      'This will save the transcript text only (no audio file). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            console.log('Saving voice note:', { title, transcript });
            Alert.alert('Success', 'Voice note text saved!', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setTranscript('');
    setTitle('');
    setRecordingUri('');
    setDuration(0);
    setIsPlaying(false);
    previousTranscript.current = '';
    try {
      Sound.stopPlayer();
      Sound.removePlayBackListener();
    } catch (error) {
      // Ignore
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerText}>
            {listening ? 'Listening...' : available ? 'Ready to Listen' : 'Not Available'}
          </Text>

          {isListening && (
            <View style={styles.listeningIndicator}>
              <Text variant="headlineMedium" style={styles.listeningText}>
                🎤 {formatTime(duration)}
              </Text>
            </View>
          )}

          {voiceTranscript && (
            <View style={styles.liveTranscript}>
              <Text variant="bodyMedium">Live: {voiceTranscript}</Text>
            </View>
          )}

          {recordingUri && !isListening && (
            <View style={styles.playbackSection}>
              <Text variant="bodyMedium">Duration: {formatTime(duration)}</Text>
              <IconButton
                icon={isPlaying ? 'pause' : 'play'}
                size={32}
                iconColor="#6200ee"
                onPress={playRecording}
              />
            </View>
          )}
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
              onPress={handleUpload}
              style={styles.button}
              loading={uploading}
              disabled={uploading || !transcript.trim()}
            >
              Save
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
  playbackSection: {
    marginTop: 16,
    alignItems: 'center',
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
