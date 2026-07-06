import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Searchbar,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { getJobs } from '../../api/jobs';
import useAuthStore from '../../store/authStore';

const JobsScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchJobs = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await getJobs({ page: pageNum, limit: 20 });

      if (response.success) {
        if (refresh || pageNum === 1) {
          setJobs(response.data.jobs);
        } else {
          setJobs([...jobs, ...response.data.jobs]);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setPage(1);
    fetchJobs(1, true);
  };

  const renderJob = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Card.Title
        title={item.title}
        subtitle={item.company_name || 'Company Name'}
        titleNumberOfLines={2}
      />
      <Card.Content>
        <View style={styles.chipContainer}>
          <Chip icon="map-marker" compact>
            {item.location}
          </Chip>
          <Chip icon="currency-usd" compact style={styles.chip}>
            PKR {item.salary_min} - {item.salary_max}
          </Chip>
          <Chip icon="briefcase" compact style={styles.chip}>
            {item.job_type}
          </Chip>
        </View>
        <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search jobs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">No jobs found</Text>
            </View>
          }
        />
      )}

      {user?.role === 'employer' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateJob')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginLeft: 4,
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default JobsScreen;
