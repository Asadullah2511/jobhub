import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BlueCollarDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    appliedJobs: [],
    savedJobs: [],
    recommendations: [],
    stats: {
      appliedCount: 0,
      savedCount: 0,
      recommendationsCount: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [applicationsRes, savedRes, recommendationsRes] = await Promise.allSettled([
        api.get('/applications/my-applications'),
        api.get('/jobs/saved'),
        api.get('/jobs/recommendations'),
      ]);

      const applications = applicationsRes.status === 'fulfilled' ? applicationsRes.value.data : [];
      const saved = savedRes.status === 'fulfilled' ? savedRes.value.data : [];
      const recommendations = recommendationsRes.status === 'fulfilled' ? recommendationsRes.value.data : [];

      setDashboardData({
        appliedJobs: Array.isArray(applications) ? applications.slice(0, 5) : [],
        savedJobs: Array.isArray(saved) ? saved.slice(0, 5) : [],
        recommendations: Array.isArray(recommendations) ? recommendations.slice(0, 6) : [],
        stats: {
          appliedCount: Array.isArray(applications) ? applications.length : 0,
          savedCount: Array.isArray(saved) ? saved.length : 0,
          recommendationsCount: Array.isArray(recommendations) ? recommendations.length : 0,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return '#FF9800';
      case 'reviewed':
        return '#2196F3';
      case 'shortlisted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'accepted':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderApplicationCard = (application) => {
    const job = application.job || application;
    return (
      <TouchableOpacity
        key={application._id || application.id}
        style={styles.applicationCard}
        onPress={() => navigation.navigate('ApplicationDetails', { applicationId: application._id })}
        activeOpacity={0.7}
      >
        <View style={styles.applicationHeader}>
          <Text style={styles.applicationTitle} numberOfLines={1}>
            {job.title || 'Job Title'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
            <Text style={styles.statusText}>
              {application.status || 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.applicationCompany} numberOfLines={1}>
          {job.company || 'Company Name'}
        </Text>
        <View style={styles.applicationFooter}>
          <View style={styles.applicationDetail}>
            <Ionicons name="location-outline" size={14} color="#757575" />
            <Text style={styles.applicationDetailText} numberOfLines={1}>
              {job.location || 'Location'}
            </Text>
          </View>
          <Text style={styles.applicationDate}>
            Applied {formatDate(application.appliedDate || application.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecommendationCard = (job) => (
    <TouchableOpacity
      key={job._id || job.id}
      style={styles.recommendationCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: job._id || job.id })}
      activeOpacity={0.7}
    >
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle} numberOfLines={2}>
          {job.title || 'Job Title'}
        </Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>
      <Text style={styles.recommendationCompany} numberOfLines={1}>
        {job.company || 'Company Name'}
      </Text>
      <View style={styles.recommendationFooter}>
        <View style={styles.recommendationDetail}>
          <Ionicons name="location-outline" size={12} color="#757575" />
          <Text style={styles.recommendationDetailText} numberOfLines={1}>
            {job.location || 'Location'}
          </Text>
        </View>
        {job.salary && (
          <View style={styles.recommendationDetail}>
            <Ionicons name="cash-outline" size={12} color="#757575" />
            <Text style={styles.recommendationDetailText}>
              ${typeof job.salary === 'number' ? job.salary.toLocaleString() : job.salary}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={32} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || user?.email || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={28} color="#2196F3" />
            <Text style={styles.statNumber}>{dashboardData.stats.appliedCount}</Text>
            <Text style={styles.statLabel}>Applied Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bookmark-outline" size={28} color="#2196F3" />
            <Text style={styles.statNumber}>{dashboardData.stats.savedCount}</Text>
            <Text style={styles.statLabel}>Saved Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bulb-outline" size={28} color="#2196F3" />
            <Text style={styles.statNumber}>{dashboardData.stats.recommendationsCount}</Text>
            <Text style={styles.statLabel}>Recommendations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            {dashboardData.appliedJobs.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {dashboardData.appliedJobs.length > 0 ? (
            dashboardData.appliedJobs.map((application) => renderApplicationCard(application))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>Start applying to jobs to see them here</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Jobs</Text>
            {dashboardData.savedJobs.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('SavedJobs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {dashboardData.savedJobs.length > 0 ? (
            dashboardData.savedJobs.slice(0, 3).map((job) => renderApplicationCard({ job, status: 'Saved' }))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="bookmark-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No saved jobs</Text>
              <Text style={styles.emptySubtext}>Save jobs you're interested in</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          {dashboardData.recommendations.length > 0 ? (
            <View style={styles.recommendationsGrid}>
              {dashboardData.recommendations.map((job) => renderRecommendationCard(job))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="bulb-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No recommendations</Text>
              <Text style={styles.emptySubtext}>Complete your profile to get personalized job recommendations</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Jobs')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Browse Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  applicationCompany: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicationDetailText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
    flex: 1,
  },
  applicationDate: {
    fontSize: 11,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  recommendationCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: '1%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 6,
    minHeight: 36,
  },
  bookmarkButton: {
    padding: 2,
  },
  recommendationCompany: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  recommendationFooter: {
    marginTop: 4,
  },
  recommendationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationDetailText: {
    fontSize: 11,
    color: '#757575',
    marginLeft: 4,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 6,
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 8,
  },
});

export default BlueCollarDashboardScreen;
