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

const WhiteCollarDashboardScreen = ({ navigation }) => {
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
        return '#FFA726';
      case 'reviewed':
        return '#5C6BC0';
      case 'shortlisted':
        return '#66BB6A';
      case 'rejected':
        return '#EF5350';
      case 'accepted':
        return '#66BB6A';
      default:
        return '#78909C';
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
            <Ionicons name="location-outline" size={14} color="#607D8B" />
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
          <Ionicons name="bookmark-outline" size={20} color="#5C6BC0" />
        </TouchableOpacity>
      </View>
      <Text style={styles.recommendationCompany} numberOfLines={1}>
        {job.company || 'Company Name'}
      </Text>
      <View style={styles.recommendationFooter}>
        <View style={styles.recommendationDetail}>
          <Ionicons name="location-outline" size={12} color="#607D8B" />
          <Text style={styles.recommendationDetailText} numberOfLines={1}>
            {job.location || 'Location'}
          </Text>
        </View>
        {job.salary && (
          <View style={styles.recommendationDetail}>
            <Ionicons name="cash-outline" size={12} color="#607D8B" />
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
        <ActivityIndicator size="large" color="#5C6BC0" />
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
                <Ionicons name="briefcase" size={32} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || user?.email || 'Professional'}</Text>
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
            colors={['#5C6BC0']}
            tintColor="#5C6BC0"
          />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase-outline" size={28} color="#5C6BC0" />
            <Text style={styles.statNumber}>{dashboardData.stats.appliedCount}</Text>
            <Text style={styles.statLabel}>Applied Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bookmark-outline" size={28} color="#5C6BC0" />
            <Text style={styles.statNumber}>{dashboardData.stats.savedCount}</Text>
            <Text style={styles.statLabel}>Saved Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles-outline" size={28} color="#5C6BC0" />
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
              <Ionicons name="briefcase-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>Start your career journey by applying to professional roles</Text>
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
              <Ionicons name="bookmark-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyText}>No saved jobs</Text>
              <Text style={styles.emptySubtext}>Bookmark opportunities that match your career goals</Text>
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
              <Ionicons name="sparkles-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyText}>No recommendations</Text>
              <Text style={styles.emptySubtext}>Complete your profile to receive personalized job recommendations</Text>
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
            <Text style={styles.primaryButtonText}>Explore Opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={20} color="#5C6BC0" />
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
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#607D8B',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#5C6BC0',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
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
    backgroundColor: '#3949AB',
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
    color: '#E8EAF6',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8EAF6',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#263238',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
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
    color: '#263238',
    letterSpacing: 0.2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#5C6BC0',
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECEFF1',
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
    color: '#263238',
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.2,
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
    color: '#607D8B',
    marginBottom: 10,
    fontWeight: '500',
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
    color: '#78909C',
    marginLeft: 4,
    flex: 1,
  },
  applicationDate: {
    fontSize: 11,
    color: '#90A4AE',
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECEFF1',
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
    color: '#263238',
    flex: 1,
    marginRight: 6,
    minHeight: 36,
    letterSpacing: 0.2,
  },
  bookmarkButton: {
    padding: 2,
  },
  recommendationCompany: {
    fontSize: 12,
    color: '#607D8B',
    marginBottom: 8,
    fontWeight: '500',
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
    color: '#78909C',
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#607D8B',
    marginTop: 12,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#90A4AE',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButtons: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#5C6BC0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#5C6BC0',
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
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5C6BC0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C6BC0',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});

export default WhiteCollarDashboardScreen;
