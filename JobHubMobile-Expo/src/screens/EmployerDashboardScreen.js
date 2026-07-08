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

const EmployerDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    postedJobs: [],
    applications: [],
    stats: {
      postedJobsCount: 0,
      activeJobsCount: 0,
      totalApplicationsCount: 0,
      pendingApplicationsCount: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [jobsRes, applicationsRes] = await Promise.allSettled([
        api.get('/jobs/employer/my-jobs'),
        api.get('/applications/employer/received'),
      ]);

      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
      const applications = applicationsRes.status === 'fulfilled' ? applicationsRes.value.data : [];

      const activeJobs = Array.isArray(jobs) ? jobs.filter(job => job.status === 'active') : [];
      const pendingApplications = Array.isArray(applications)
        ? applications.filter(app => app.status?.toLowerCase() === 'pending')
        : [];

      setDashboardData({
        postedJobs: Array.isArray(jobs) ? jobs.slice(0, 5) : [],
        applications: Array.isArray(applications) ? applications.slice(0, 5) : [],
        stats: {
          postedJobsCount: Array.isArray(jobs) ? jobs.length : 0,
          activeJobsCount: activeJobs.length,
          totalApplicationsCount: Array.isArray(applications) ? applications.length : 0,
          pendingApplicationsCount: pendingApplications.length,
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

  const getJobStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return '#4CAF50';
      case 'draft':
        return '#FF9800';
      case 'closed':
        return '#F44336';
      case 'paused':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getApplicationStatusColor = (status) => {
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

  const renderJobCard = (job) => {
    const applicationsCount = job.applicationsCount || 0;
    return (
      <TouchableOpacity
        key={job._id || job.id}
        style={styles.jobCard}
        onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title || 'Job Title'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getJobStatusColor(job.status) }]}>
            <Text style={styles.statusText}>
              {job.status || 'Active'}
            </Text>
          </View>
        </View>
        <View style={styles.jobDetails}>
          <View style={styles.jobDetail}>
            <Ionicons name="location-outline" size={14} color="#757575" />
            <Text style={styles.jobDetailText} numberOfLines={1}>
              {job.location || 'Location'}
            </Text>
          </View>
          <View style={styles.jobDetail}>
            <Ionicons name="briefcase-outline" size={14} color="#757575" />
            <Text style={styles.jobDetailText}>
              {job.type || 'Full-time'}
            </Text>
          </View>
        </View>
        <View style={styles.jobFooter}>
          <View style={styles.applicationsCount}>
            <Ionicons name="people-outline" size={16} color="#2196F3" />
            <Text style={styles.applicationsCountText}>
              {applicationsCount} {applicationsCount === 1 ? 'Application' : 'Applications'}
            </Text>
          </View>
          <Text style={styles.jobDate}>
            Posted {formatDate(job.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderApplicationCard = (application) => {
    const job = application.job || {};
    const applicant = application.applicant || {};
    return (
      <TouchableOpacity
        key={application._id || application.id}
        style={styles.applicationCard}
        onPress={() => navigation.navigate('ApplicationDetails', { applicationId: application._id })}
        activeOpacity={0.7}
      >
        <View style={styles.applicationHeader}>
          <View style={styles.applicantInfo}>
            <View style={styles.applicantAvatar}>
              {applicant.profilePicture ? (
                <Image source={{ uri: applicant.profilePicture }} style={styles.applicantAvatarImage} />
              ) : (
                <Ionicons name="person" size={20} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.applicantDetails}>
              <Text style={styles.applicantName} numberOfLines={1}>
                {applicant.name || 'Applicant Name'}
              </Text>
              <Text style={styles.jobTitleText} numberOfLines={1}>
                Applied for: {job.title || 'Job Title'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getApplicationStatusColor(application.status) }]}>
            <Text style={styles.statusText}>
              {application.status || 'Pending'}
            </Text>
          </View>
        </View>
        <View style={styles.applicationFooter}>
          <View style={styles.applicationDetail}>
            <Ionicons name="mail-outline" size={14} color="#757575" />
            <Text style={styles.applicationDetailText} numberOfLines={1}>
              {applicant.email || 'email@example.com'}
            </Text>
          </View>
          <Text style={styles.applicationDate}>
            {formatDate(application.appliedDate || application.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
                <Ionicons name="business" size={32} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.companyName || user?.name || user?.email || 'Employer'}</Text>
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
            <Ionicons name="briefcase-outline" size={28} color="#2196F3" />
            <Text style={styles.statNumber}>{dashboardData.stats.postedJobsCount}</Text>
            <Text style={styles.statLabel}>Posted Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
            <Text style={styles.statNumber}>{dashboardData.stats.activeJobsCount}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={28} color="#2196F3" />
            <Text style={styles.statNumber}>{dashboardData.stats.totalApplicationsCount}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.postJobButton}
            onPress={() => navigation.navigate('PostJob')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.postJobButtonText}>Post New Job</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.stats.pendingApplicationsCount > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="notifications" size={24} color="#FF9800" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Applications</Text>
              <Text style={styles.alertText}>
                You have {dashboardData.stats.pendingApplicationsCount} new {dashboardData.stats.pendingApplicationsCount === 1 ? 'application' : 'applications'} waiting for review
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            {dashboardData.applications.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('ManageApplications')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {dashboardData.applications.length > 0 ? (
            dashboardData.applications.map((application) => renderApplicationCard(application))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>Applications will appear here once candidates start applying</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Jobs</Text>
            {dashboardData.postedJobs.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('ManageJobs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {dashboardData.postedJobs.length > 0 ? (
            dashboardData.postedJobs.map((job) => renderJobCard(job))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="briefcase-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No jobs posted yet</Text>
              <Text style={styles.emptySubtext}>Start by posting your first job to attract talented candidates</Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate('PostJob')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionButtonText}>Post a Job</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.8}
          >
            <Ionicons name="stats-chart" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>View Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('CompanyProfile')}
            activeOpacity={0.8}
          >
            <Ionicons name="business" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Company Profile</Text>
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
  quickActionsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  postJobButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  postJobButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#F57C00',
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
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
  jobDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  jobDetailText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  applicationsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationsCountText: {
    fontSize: 13,
    color: '#2196F3',
    marginLeft: 6,
    fontWeight: '600',
  },
  jobDate: {
    fontSize: 11,
    color: '#9E9E9E',
    fontStyle: 'italic',
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
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  applicantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  jobTitleText: {
    fontSize: 13,
    color: '#757575',
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
  emptyActionButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButtons: {
    paddingHorizontal: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 8,
  },
});

export default EmployerDashboardScreen;
