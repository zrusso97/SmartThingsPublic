import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';

import { useAuth } from '../hooks/useAuth';
import { createTask, EffortLevel } from '../services/tasks';
import { COLORS, EFFORT_CONFIG } from '../constants/theme';

export default function CreateTaskScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [effort, setEffort] = useState<EffortLevel>('easy');
  const [rewardPoints, setRewardPoints] = useState('10');
  const [estimatedMinutes, setEstimatedMinutes] = useState('15');
  const [loading, setLoading] = useState(false);

  // Pre-fill with current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude.toFixed(6));
        setLongitude(loc.coords.longitude.toFixed(6));
      }
    })();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Title and description are required.');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Location coordinates are required.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await createTask(user.id, {
        title: title.trim(),
        description: description.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName.trim() || undefined,
        effort,
        reward_points: parseInt(rewardPoints, 10) || 10,
        estimated_minutes: parseInt(estimatedMinutes, 10) || 15,
      });
      Alert.alert('Success', 'Task created! It will now appear on the map.');
      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setEffort('easy');
      setRewardPoints('10');
      setEstimatedMinutes('15');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Task Details</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pick up litter at Elm Park"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Describe what needs to be done..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.sectionTitle}>Location</Text>

        <Text style={styles.label}>Location Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Elm Street Park entrance"
          value={locationName}
          onChangeText={setLocationName}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Effort & Reward</Text>

        <Text style={styles.label}>Effort Level</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['easy', 'medium', 'hard'] as EffortLevel[]).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.effortChip,
                {
                  backgroundColor: effort === level ? EFFORT_CONFIG[level].color : COLORS.white,
                  borderColor: EFFORT_CONFIG[level].color,
                },
              ]}
              onPress={() => setEffort(level)}
            >
              <Text
                style={{
                  color: effort === level ? COLORS.white : EFFORT_CONFIG[level].color,
                  fontWeight: '600',
                }}
              >
                {EFFORT_CONFIG[level].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Reward Points</Text>
            <TextInput
              style={styles.input}
              value={rewardPoints}
              onChangeText={setRewardPoints}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Est. Minutes</Text>
            <TextInput
              style={styles.input}
              value={estimatedMinutes}
              onChangeText={setEstimatedMinutes}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { opacity: loading ? 0.6 : 1 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
            {loading ? 'Creating...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    color: COLORS.black,
  },
  effortChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
});
