import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
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
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';
//@ts-ignore
import { initWhisper } from 'whisper.rn';
import { RootStackParamList } from '../../types/types';
import { voiceNoteService } from '../../services/voiceNoteService';

type CreateVoiceNoteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateVoiceNote'>;
};

const CreateVoiceNoteScreen: React.FC<CreateVoiceNoteScreenProps> = ({
  navigation,
}) => {
  // Note: Sound from react-native-nitro-sound is a singleton instance
  // We use it directly without creating instances
  const tempRecordingPath = useRef<string>('');
  const whisperContext = useRef<any>(null);

  const [recordingUri, setRecordingUri] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [durationInterval, setDurationInterval] = useState<number | null>(null);

  // Initialize Whisper on mount
  useEffect(() => {
    const initializeWhisper = async () => {
      try {
        whisperContext.current = await initWhisper({
          filePath: require('../../assets/ggml-tiny.en.bin'),
        });
        console.log('Whisper initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Whisper:', error);
        Alert.alert(
          'Whisper Initialization Failed',
          'Transcription will not be available. Please ensure the model file is downloaded.',
        );
      }
    };

    initializeWhisper();

    return () => {
      cleanupAudio();
      if (whisperContext.current) {
        whisperContext.current.release();
      }
    };
  }, []);

  const cleanupAudio = async () => {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removeRecordBackListener();
    } catch (error) {
      // Ignore errors if nothing is playing
    }
    if (durationInterval) {
      clearInterval(durationInterval);
    }
  };

  const startRecording = async () => {
    // Request permissions on Android
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Microphone permission is required to record audio.',
          );
          return;
        }
      } catch (err) {
        console.error('Permission error:', err);
        return;
      }
    }

    try {
      // Create file path for recording
      const fileName = `recording_${Date.now()}.m4a`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Set up recording progress listener
      Sound.addRecordBackListener((e: any) => {
        setDuration(Math.floor(e.currentPosition / 1000)); // Convert ms to seconds
      });

      // Start audio recording
      await Sound.startRecorder(filePath);
      // Store path temporarily - will be moved to recordingUri when recording stops
      tempRecordingPath.current = filePath;
      setIsRecording(true);

      // Note: Voice recognition disabled during recording
      // Audio recording uses the microphone, so speech recognition can't work simultaneously
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      // Stop audio recording and get the file URI
      const uri = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      setIsRecording(false);

      // Set the recording URI from either the returned URI or the temp path
      const finalUri = uri || tempRecordingPath.current;
      if (finalUri) {
        setRecordingUri(finalUri);

        // Automatically transcribe the recorded audio
        await transcribeAudio(finalUri);
      }

      // Clear temp path
      tempRecordingPath.current = '';
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioPath: string) => {
    if (!whisperContext.current) {
      console.error('Whisper context not initialized');
      return;
    }

    try {
      setIsTranscribing(true);
      console.log('Starting transcription for:', audioPath);

      const { promise } = whisperContext.current.transcribe(
        audioPath.startsWith('file://') ? audioPath : `file://${audioPath}`,
        { language: 'en' },
      );

      const { result } = await promise;
      console.log('Transcription result:', result);

      setTranscript(result || '');
      setIsTranscribing(false);
    } catch (error) {
      console.error('Transcription failed:', error);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe audio. You can manually enter the transcript.',
      );
      setIsTranscribing(false);
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

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
            // Update playback progress if needed
            if (e.currentPosition === e.duration && e.duration > 0) {
              setIsPlaying(false);
            }
          });

          // Set up playback end listener
          Sound.addPlaybackEndListener(() => {
            setIsPlaying(false);
          });

          await Sound.startPlayer(recordingUri);
          setIsPlaying(true);
        } catch (loadError) {
          console.error('Failed to load or play recording:', loadError);
          Alert.alert('Error', 'Failed to load or play recording.');
          setIsPlaying(false);
        }
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
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found. Please record audio first.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your voice note.');
      return;
    }

    try {
      setUploading(true);

      // Prepare file for upload
      const filename = recordingUri.split('/').pop() || 'recording.m4a';
      const file = {
        uri: recordingUri,
        name: filename,
        type: 'audio/m4a',
      };

      // Prepare metadata
      const meta = {
        title: title.trim(),
        transcriptText: transcript || 'No transcript available',
        durationInSeconds: duration,
        language: 'en',
      };

      // Upload
      const response = await voiceNoteService.uploadVoiceNote(file, meta);

      Alert.alert('Success', 'Voice note uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to upload voice note:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message ||
          'Failed to upload voice note. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const resetRecording = async () => {
    setRecordingUri('');
    setDuration(0);
    setTranscript('');
    setTitle('');
    setIsPlaying(false);
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      Sound.removeRecordBackListener();
    } catch (error) {
      // Ignore errors if nothing is playing
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerText}>
            {isRecording
              ? 'Recording...'
              : recordingUri
              ? 'Recording Complete'
              : 'Ready to Record'}
          </Text>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <IconButton icon="microphone" size={40} iconColor="#f44336" />
              <Text variant="headlineMedium" style={styles.timerText}>
                {formatTime(duration)}
              </Text>
            </View>
          )}

          {!isRecording && recordingUri && (
            <View style={styles.playbackSection}>
              <Text variant="bodyMedium" style={styles.durationText}>
                Duration: {formatTime(duration)}
              </Text>

              {isTranscribing && (
                <Text variant="bodySmall" style={styles.transcribingText}>
                  🎙️ Transcribing audio...
                </Text>
              )}

              <View style={styles.playbackControls}>
                <IconButton
                  icon={isPlaying ? 'pause' : 'play'}
                  size={40}
                  iconColor="#6200ee"
                  onPress={playRecording}
                />
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {recordingUri && (
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
              placeholder="Type what was said in the recording..."
              multiline
              numberOfLines={6}
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={resetRecording}
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
                disabled={uploading}
              >
                Upload
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {(!recordingUri || isRecording) && (
        <FAB
          icon={isRecording ? 'stop' : 'microphone'}
          style={[styles.fab, isRecording && styles.fabRecording]}
          onPress={isRecording ? stopRecording : startRecording}
          label={isRecording ? 'Stop' : 'Record'}
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
  recordingIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerText: {
    marginTop: 8,
    color: '#f44336',
    fontWeight: 'bold',
  },
  playbackSection: {
    paddingVertical: 20,
  },
  durationText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  playbackControls: {
    alignItems: 'center',
    marginBottom: 16,
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
  fabRecording: {
    backgroundColor: '#f44336',
  },
  transcribingText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#6200ee',
    fontStyle: 'italic',
  },
});

export default CreateVoiceNoteScreen;
