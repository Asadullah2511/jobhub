import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import useAuthStore from '../../store/authStore';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading } = useAuthStore();

  const validate = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Username or phone is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    const result = await login(identifier, password);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Please check your credentials');
    }
    // Navigation will be handled by AppNavigator based on isAuthenticated state
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              JobHub
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Find your dream job or hire skilled workers
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Username or Phone"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setErrors({ ...errors, identifier: null });
              }}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              error={!!errors.identifier}
              disabled={loading}
            />
            {errors.identifier && (
              <HelperText type="error" visible={true}>
                {errors.identifier}
              </HelperText>
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: null });
              }}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!errors.password}
              disabled={loading}
            />
            {errors.password && (
              <HelperText type="error" visible={true}>
                {errors.password}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              compact
            >
              Register
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  forgotButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
