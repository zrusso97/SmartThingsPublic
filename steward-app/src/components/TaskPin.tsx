import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Task } from '../services/tasks';
import { EFFORT_CONFIG } from '../constants/theme';

interface TaskPinProps {
  task: Task;
  onPress: () => void;
}

/**
 * Custom map marker with color-coded effort indicator.
 * Can be used as a drop-in replacement for the default Marker
 * when more visual customization is needed.
 */
export default function TaskPin({ task, onPress }: TaskPinProps) {
  const effortCfg = EFFORT_CONFIG[task.effort];

  return (
    <Marker
      coordinate={{ latitude: task.latitude, longitude: task.longitude }}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View style={[styles.pin, { backgroundColor: effortCfg.color }]}>
          <Text style={styles.points}>{task.reward_points}</Text>
        </View>
        <View style={[styles.arrow, { borderTopColor: effortCfg.color }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  points: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
