import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  List,
  Avatar,
  Button,
  Text,
  Divider,
  IconButton,
} from 'react-native-paper';
import useAuthStore from '../../store/authStore';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text variant="bodyMedium" style={styles.username}>
          @{user?.user_id}
        </Text>
        <Text variant="bodySmall" style={styles.role}>
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <Divider />

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Edit Profile"
          description="Update your information"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="Change Password"
          description="Update your password"
          left={(props) => <List.Icon {...props} icon="lock" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Activity</List.Subheader>
        <List.Item
          title="My Applications"
          description="View your job applications"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('MyApplications')}
        />
        {user?.role === 'employer' && (
          <List.Item
            title="My Jobs"
            description="Manage your job postings"
            left={(props) => <List.Icon {...props} icon="briefcase" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('MyJobs')}
          />
        )}
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Settings</List.Subheader>
        <List.Item
          title="Notifications"
          description="Manage notification preferences"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
        <List.Item
          title="Privacy"
          description="Privacy and security"
          left={(props) => <List.Icon {...props} icon="shield-check" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Help & Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Help')}
        />
        <List.Item
          title="Terms & Conditions"
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Terms')}
        />
      </List.Section>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          buttonColor="#f44336"
        >
          Logout
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          JobHub Mobile v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  username: {
    color: '#666',
    marginTop: 4,
  },
  role: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2196F3',
    color: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutContainer: {
    padding: 24,
    paddingTop: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    color: '#999',
  },
});

export default ProfileScreen;
