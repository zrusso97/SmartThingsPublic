import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

import { useAuth } from '../hooks/useAuth';
import PhotoUploader from '../components/PhotoUploader';
import { uploadPhoto, createSubmission } from '../services/submissions';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProofRoute = RouteProp<RootStackParamList, 'ProofOfWork'>;

export default function ProofOfWorkScreen() {
  const route = useRoute<ProofRoute>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { taskId, taskTitle } = route.params;

  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [afterUri, setAfterUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!beforeUri || !afterUri) {
      Alert.alert('Photos required', 'Please upload both a Before and After photo.');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const beforeUrl = await uploadPhoto(user.id, taskId, beforeUri, 'before');
      const afterUrl = await uploadPhoto(user.id, taskId, afterUri, 'after');
      await createSubmission(taskId, user.id, beforeUrl, afterUrl, notes);

      Alert.alert(
        'Submitted!',
        'Your proof of work has been submitted for review. Credits will be awarded upon approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.taskTitle}>{taskTitle}</Text>
      <Text style={styles.instructions}>
        Upload a photo of the area before and after you completed the task.
      </Text>

      {/* Before Photo */}
      <Text style={styles.label}>Before Photo</Text>
      {beforeUri ? (
        <TouchableOpacity onPress={() => setBeforeUri(null)}>
          <Image source={{ uri: beforeUri }} style={styles.preview} />
          <Text style={styles.tapToChange}>Tap to change</Text>
        </TouchableOpacity>
      ) : (
        <PhotoUploader onImageSelected={setBeforeUri} label="Take or select BEFORE photo" />
      )}

      {/* After Photo */}
      <Text style={[styles.label, { marginTop: 20 }]}>After Photo</Text>
      {afterUri ? (
        <TouchableOpacity onPress={() => setAfterUri(null)}>
          <Image source={{ uri: afterUri }} style={styles.preview} />
          <Text style={styles.tapToChange}>Tap to change</Text>
        </TouchableOpacity>
      ) : (
        <PhotoUploader onImageSelected={setAfterUri} label="Take or select AFTER photo" />
      )}

      {/* Notes */}
      <Text style={[styles.label, { marginTop: 20 }]}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Any additional details about the work done..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { opacity: submitting ? 0.6 : 1 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
          {submitting ? 'Uploading...' : 'Submit Proof of Work'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.grayLight,
  },
  tapToChange: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: COLORS.white,
    color: COLORS.black,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
});
