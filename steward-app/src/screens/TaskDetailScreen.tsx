import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../hooks/useAuth';
import { Task, fetchTaskById, claimTask } from '../services/tasks';
import { COLORS, EFFORT_CONFIG } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type DetailRoute = RouteProp<RootStackParamList, 'TaskDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTaskById(route.params.taskId);
        setTask(data);
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.taskId]);

  const handleClaim = async () => {
    if (!task || !user) return;
    setClaiming(true);
    try {
      await claimTask(task.id, user.id);
      setTask({ ...task, status: 'in_progress', claimed_by: user.id });
      Alert.alert('Claimed!', 'This task is now yours. Complete it to earn credits!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !task) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const effortCfg = EFFORT_CONFIG[task.effort];
  const isClaimedByMe = task.claimed_by === user?.id;
  const isOpen = task.status === 'open';
  const isInProgress = task.status === 'in_progress';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={[styles.badge, { backgroundColor: effortCfg.color }]}>
            <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 12 }}>
              {effortCfg.label}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.gold, marginLeft: 8 }]}>
            <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 12 }}>
              {task.reward_points} pts
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        {task.location_name && (
          <Text style={styles.locationText}>{task.location_name}</Text>
        )}

        <Text style={styles.meta}>
          Est. {task.estimated_minutes} min · Status: {task.status.replace('_', ' ')}
        </Text>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={{ color: COLORS.black, fontSize: 15, lineHeight: 22 }}>
            {task.description}
          </Text>
        </View>

        {/* Coordinates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={{ color: COLORS.gray, fontSize: 14 }}>
            {task.latitude.toFixed(6)}, {task.longitude.toFixed(6)}
          </Text>
        </View>

        {/* Actions */}
        {isOpen && (
          <TouchableOpacity
            style={[styles.primaryBtn, { opacity: claiming ? 0.6 : 1 }]}
            onPress={handleClaim}
            disabled={claiming}
          >
            <Text style={styles.btnText}>
              {claiming ? 'Claiming...' : 'Claim This Task'}
            </Text>
          </TouchableOpacity>
        )}

        {isInProgress && isClaimedByMe && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('ProofOfWork', {
                taskId: task.id,
                taskTitle: task.title,
              })
            }
          >
            <Text style={styles.btnText}>Submit Proof of Work</Text>
          </TouchableOpacity>
        )}

        {isInProgress && !isClaimedByMe && (
          <View style={styles.infoBox}>
            <Text style={{ color: COLORS.gray, textAlign: 'center' }}>
              This task has been claimed by another volunteer.
            </Text>
          </View>
        )}

        {task.status === 'completed' && (
          <View style={[styles.infoBox, { backgroundColor: '#E8F5E9' }]}>
            <Text style={{ color: COLORS.primary, textAlign: 'center', fontWeight: '600' }}>
              This task has been completed!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
});
