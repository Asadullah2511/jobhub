import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.126:5000/api';

const INDUSTRIES = [
  'All',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
];

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, location, selectedIndustry, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs/public`);
      // Backend returns { success: true, data: [...] }
      const jobsData = response.data.data || response.data || [];
      setJobs(jobsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]); // Show empty state instead of error alert
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (selectedIndustry !== 'All') {
      filtered = filtered.filter(
        (job) =>
          job.industry &&
          job.industry.toLowerCase() === selectedIndustry.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (location.trim()) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString()}`;
    }
    return salary;
  };

  const renderJobCard = (job) => (
    <TouchableOpacity
      key={job._id || job.id}
      style={styles.jobCard}
      onPress={() => navigation?.navigate('JobDetails', { jobId: job._id || job.id })}
      activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{job.title || 'Job Title'}</Text>
          <Text style={styles.company}>{job.company || 'Company Name'}</Text>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>{job.location || 'Location not specified'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>{formatSalary(job.salary)}</Text>
        </View>

        {job.jobType && (
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={16} color="#757575" />
            <Text style={styles.detailText}>{job.jobType}</Text>
          </View>
        )}
      </View>

      {job.industry && (
        <View style={styles.industryTag}>
          <Text style={styles.industryTagText}>{job.industry}</Text>
        </View>
      )}

      {job.postedDate && (
        <Text style={styles.postedDate}>
          Posted {new Date(job.postedDate).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Dream Job</Text>
        <Text style={styles.headerSubtitle}>
          {filteredJobs.length} jobs available
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs or companies"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="location-outline" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#999"
          />
          {location.length > 0 && (
            <TouchableOpacity onPress={() => setLocation('')}>
              <Ionicons name="close-circle" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.industryTabsContainer}
        contentContainerStyle={styles.industryTabsContent}
      >
        {INDUSTRIES.map((industry) => (
          <TouchableOpacity
            key={industry}
            style={[
              styles.industryTab,
              selectedIndustry === industry && styles.industryTabActive,
            ]}
            onPress={() => setSelectedIndustry(industry)}
          >
            <Text
              style={[
                styles.industryTabText,
                selectedIndustry === industry && styles.industryTabTextActive,
              ]}
            >
              {industry}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.jobsContainer}
          contentContainerStyle={styles.jobsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
        >
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => renderJobCard(job))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No jobs found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search filters
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#212121',
  },
  industryTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  industryTabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  industryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  industryTabActive: {
    backgroundColor: '#2196F3',
  },
  industryTabText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  industryTabTextActive: {
    color: '#FFFFFF',
  },
  jobsContainer: {
    flex: 1,
  },
  jobsContent: {
    padding: 15,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#757575',
  },
  bookmarkButton: {
    padding: 4,
  },
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  industryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  industryTagText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  postedDate: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
  },
});

export default HomeScreen;
