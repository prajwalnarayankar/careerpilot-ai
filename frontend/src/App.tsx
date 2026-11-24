import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AppLayout } from './layouts/AppLayout';

// 19 Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumeManagerPage } from './pages/ResumeManagerPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { AtsAnalysisPage } from './pages/AtsAnalysisPage';
import { JobSearchPage } from './pages/JobSearchPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { RecommendedJobsPage } from './pages/RecommendedJobsPage';
import { JobMatchAnalysisPage } from './pages/JobMatchAnalysisPage';
import { ResumeOptimizationPage } from './pages/ResumeOptimizationPage';
import { CoverLetterGeneratorPage } from './pages/CoverLetterGeneratorPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage';
import { SettingsPage } from './pages/SettingsPage';
import { CareerInsightsPage } from './pages/CareerInsightsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirect to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected SaaS App Pages */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resumes" element={<ResumeManagerPage />} />
              <Route path="/resumes/upload" element={<ResumeUploadPage />} />
              <Route path="/ats-analysis" element={<AtsAnalysisPage />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/jobs/recommended" element={<RecommendedJobsPage />} />
              <Route path="/match-analysis" element={<JobMatchAnalysisPage />} />
              <Route path="/resume-optimization" element={<ResumeOptimizationPage />} />
              <Route path="/cover-letter" element={<CoverLetterGeneratorPage />} />
              <Route path="/interview-prep" element={<InterviewPrepPage />} />
              <Route path="/mock-interview" element={<MockInterviewPage />} />
              <Route path="/applications" element={<ApplicationTrackerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/insights" element={<CareerInsightsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
