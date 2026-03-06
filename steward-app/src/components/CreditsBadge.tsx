import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface CreditsBadgeProps {
  credits: number;
}

export default function CreditsBadge({ credits }: CreditsBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="wallet-outline" size={28} color={COLORS.gold} />
      </View>
      <View style={{ marginLeft: 16 }}>
        <Text style={styles.label}>Civic Credits</Text>
        <Text style={styles.amount}>{credits.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
});
