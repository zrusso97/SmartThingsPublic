import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signIn, signUp } from '../services/auth';
import { COLORS } from '../constants/theme';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in email and password.');
      return;
    }
    if (isSignUp && !username) {
      Alert.alert('Error', 'Please choose a username.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username);
        Alert.alert('Success', 'Account created! Check your email to verify.');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 42, fontWeight: 'bold', color: COLORS.white }}>
            Steward
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.cream, marginTop: 4 }}>
            The Civic Maintenance Engine
          </Text>
        </View>

        {/* Form */}
        <View style={{ backgroundColor: COLORS.white, borderRadius: 16, padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '600', color: COLORS.black, marginBottom: 20 }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>

          {isSignUp && (
            <TextInput
              style={inputStyle}
              placeholder="Username"
              placeholderTextColor={COLORS.gray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}

          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={inputStyle}
            placeholder="Password"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 8,
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{ color: COLORS.primary, fontSize: 14 }}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  marginBottom: 12,
  color: '#1A1A1A',
} as const;
