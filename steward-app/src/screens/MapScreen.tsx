import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTasks } from '../hooks/useTasks';
import { COLORS, EFFORT_CONFIG, DEFAULT_REGION } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import TaskCard from '../components/TaskCard';
import { Task } from '../services/tasks';

type MapNav = NativeStackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<MapNav>();
  const { tasks, loading, error, refresh } = useTasks();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access helps find tasks near you.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: COLORS.gray }}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.red }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        onPress={() => setSelectedTask(null)}
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            pinColor={EFFORT_CONFIG[task.effort].pinColor}
            title={task.title}
            description={`${EFFORT_CONFIG[task.effort].label} · ${task.reward_points} pts`}
            onPress={() => setSelectedTask(task)}
          />
        ))}
      </MapView>

      {selectedTask && (
        <View style={styles.cardOverlay}>
          <TaskCard
            task={selectedTask}
            onPress={() => navigation.navigate('TaskDetail', { taskId: selectedTask.id })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});
