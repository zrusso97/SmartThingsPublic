import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../services/tasks';
import { COLORS, EFFORT_CONFIG } from '../constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const effortCfg = EFFORT_CONFIG[task.effort];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={[styles.dot, { backgroundColor: effortCfg.color }]} />
        <Text style={styles.effortLabel}>{effortCfg.label}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.points}>{task.reward_points} pts</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {task.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.gray} />
          <Text style={styles.footerText}>{task.estimated_minutes} min</Text>
        </View>
        {task.location_name && (
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={styles.footerText} numberOfLines={1}>
              {task.location_name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  effortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  points: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});
