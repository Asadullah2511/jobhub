import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardPage from './pages/DashboardPage';
import PostJobPage from './pages/employer/PostJobPage';
import ApplicantsPage from './pages/employer/ApplicantsPage';
import TaskAssignmentPage from './pages/employer/TaskAssignmentPage';
import HiringHistoryPage from './pages/employer/HiringHistoryPage';
import CVUploadPage from './pages/whitecollar/CVUploadPage';
import JobMatchingPage from './pages/whitecollar/JobMatchingPage';
import ApplicationsPage from './pages/whitecollar/ApplicationsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/role-selection"
          element={
            <PublicRoute>
              <RoleSelectionPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Employer Routes */}
        <Route
          path="/employer/post-job"
          element={
            <ProtectedRoute>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applicants"
          element={
            <ProtectedRoute>
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/task-assignment"
          element={
            <ProtectedRoute>
              <TaskAssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/hiring-history"
          element={
            <ProtectedRoute>
              <HiringHistoryPage />
            </ProtectedRoute>
          }
        />
        {/* White Collar Routes */}
        <Route
          path="/whitecollar/cv-upload"
          element={
            <ProtectedRoute>
              <CVUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whitecollar/job-matching"
          element={
            <ProtectedRoute>
              <JobMatchingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whitecollar/applications"
          element={
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
