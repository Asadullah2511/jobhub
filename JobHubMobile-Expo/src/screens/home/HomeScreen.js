import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, Chip } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall">Welcome back,</Text>
          <Text variant="titleLarge" style={styles.name}>
            {user?.first_name} {user?.last_name}
          </Text>
        </View>
        <Avatar.Text
          size={48}
          label={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
        />
      </View>

      <View style={styles.roleChip}>
        <Chip icon="account" mode="outlined">
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Chip>
      </View>

      <Card style={styles.card}>
        <Card.Title
          title="Job Market"
          subtitle="Explore opportunities"
          left={(props) => <Avatar.Icon {...props} icon="briefcase" />}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            Browse thousands of jobs tailored to your skills
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Jobs')}>
            Browse Jobs
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Nearby Jobs"
          subtitle="Jobs in your area"
          left={(props) => <Avatar.Icon {...props} icon="map-marker" />}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            Find opportunities near you
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Map')}>
            View Map
          </Button>
        </Card.Actions>
      </Card>

      {user?.role === 'employer' && (
        <Card style={styles.card}>
          <Card.Title
            title="Post a Job"
            subtitle="Find the right candidate"
            left={(props) => <Avatar.Icon {...props} icon="plus-circle" />}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              Create a new job posting
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('CreateJob')}>
              Create Job
            </Button>
          </Card.Actions>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Title
          title="My Applications"
          subtitle="Track your progress"
          left={(props) => <Avatar.Icon {...props} icon="file-document" />}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            View and manage your applications
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('MyApplications')}>
            View Applications
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  roleChip: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
});

export default HomeScreen;
