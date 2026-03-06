import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/auth';
import { supabase } from '../services/supabase';
import { COLORS } from '../constants/theme';
import CreditsBadge from '../components/CreditsBadge';

interface Profile {
  username: string;
  civic_credits: number;
  tasks_completed: number;
  created_at: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, civic_credits, tasks_completed, created_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh profile data every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Avatar / Username */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color={COLORS.white} />
        </View>
        <Text style={styles.username}>{profile?.username || 'Unknown'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Civic Credits Wallet */}
      <CreditsBadge credits={profile?.civic_credits ?? 0} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile?.tasks_completed ?? 0}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile?.civic_credits ?? 0}</Text>
          <Text style={styles.statLabel}>Total Credits</Text>
        </View>
      </View>

      {/* Member Since */}
      <View style={styles.infoCard}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
        <Text style={{ color: COLORS.gray, marginLeft: 8 }}>
          Member since{' '}
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : '—'}
        </Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
        <Text style={{ color: COLORS.red, fontWeight: '600', marginLeft: 8 }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
});
