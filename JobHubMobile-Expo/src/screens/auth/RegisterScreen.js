import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import useAuthStore from '../../store/authStore';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'employer',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, loading } = useAuthStore();

  const roles = [
    { value: 'blue_collar', label: 'Blue Collar' },
    { value: 'white_collar', label: 'White Collar' },
    { value: 'employer', label: 'Employer' },
  ];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.user_id.trim()) {
      newErrors.user_id = 'Username is required';
    } else if (formData.user_id.length < 3) {
      newErrors.user_id = 'Username must be at least 3 characters';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join JobHub today
            </Text>
          </View>

          <View style={styles.form}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              I am a:
            </Text>
            <SegmentedButtons
              value={formData.role}
              onValueChange={(value) => updateField('role', value)}
              buttons={roles}
              style={styles.roleSelector}
            />

            <TextInput
              label="Username"
              value={formData.user_id}
              onChangeText={(text) => updateField('user_id', text)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              error={!!errors.user_id}
              disabled={loading}
            />
            {errors.user_id && (
              <HelperText type="error">{errors.user_id}</HelperText>
            )}

            <TextInput
              label="First Name"
              value={formData.first_name}
              onChangeText={(text) => updateField('first_name', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.first_name}
              disabled={loading}
            />
            {errors.first_name && (
              <HelperText type="error">{errors.first_name}</HelperText>
            )}

            <TextInput
              label="Last Name"
              value={formData.last_name}
              onChangeText={(text) => updateField('last_name', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.last_name}
              disabled={loading}
            />
            {errors.last_name && (
              <HelperText type="error">{errors.last_name}</HelperText>
            )}

            <TextInput
              label="Phone (Optional)"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              disabled={loading}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
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
              <HelperText type="error">{errors.password}</HelperText>
            )}

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              error={!!errors.confirmPassword}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <HelperText type="error">{errors.confirmPassword}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              disabled={loading}
              loading={loading}
            >
              Register
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              disabled={loading}
              compact
            >
              Login
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
    marginBottom: 32,
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
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  roleSelector: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
