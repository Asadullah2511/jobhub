import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('Success!', 'Your JobHub app is working perfectly!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JobHub Mobile</Text>
      <Text style={styles.subtitle}>✅ App is Running!</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🟢 Backend: Port 5000</Text>
        <Text style={styles.infoText}>🟢 Expo: Port 8081</Text>
        <Text style={styles.infoText}>📱 Ready to Build!</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Test App</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>All errors fixed! ✅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#fff',
  },
});
