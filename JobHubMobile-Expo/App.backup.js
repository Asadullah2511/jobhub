import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import useAuthStore from './src/store/authStore';

export default function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Load saved user session on app start
    loadUser();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
