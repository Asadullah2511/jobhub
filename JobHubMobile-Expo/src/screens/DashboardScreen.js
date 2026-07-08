import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import BlueCollarDashboardScreen from './BlueCollarDashboardScreen';
import WhiteCollarDashboardScreen from './WhiteCollarDashboardScreen';
import EmployerDashboardScreen from './EmployerDashboardScreen';

const DashboardScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please login to view dashboard</Text>
      </View>
    );
  }

  // Render the appropriate dashboard based on user role
  const role = (user.role || '').toLowerCase().replace(/[_\s-]/g, '');

  if (role === 'bluecollar' || role === 'blue_collar') {
    return <BlueCollarDashboardScreen navigation={navigation} />;
  }

  if (role === 'whitecollar' || role === 'white_collar') {
    return <WhiteCollarDashboardScreen navigation={navigation} />;
  }

  if (role === 'employer') {
    return <EmployerDashboardScreen navigation={navigation} />;
  }

  // Default fallback
  return (
    <View style={styles.container}>
      <Text style={styles.roleText}>👤 {user.role || 'User'} Dashboard</Text>
      <Text style={styles.welcomeText}>Welcome, {user.first_name}!</Text>
      <Text style={styles.subText}>Your dashboard is being set up...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  roleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
});

export default DashboardScreen;
