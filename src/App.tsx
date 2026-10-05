import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Screens
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { Verification } from './pages/Verification';
import { Profile } from './pages/Profile';
import { Home } from './pages/Home';
import { MatchResults } from './pages/MatchResults';
import { MatchDetail } from './pages/MatchDetail';
import { Requests } from './pages/Requests';
import { ActiveRide } from './pages/ActiveRide';
import { PostRideRating } from './pages/PostRideRating';
import { MyRides } from './pages/MyRides';
import { PrivacySettings } from './pages/PrivacySettings';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const isOnboarded = localStorage.getItem('campusride_onboarded');

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Admin Protected Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser || !currentUser.is_admin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />

            {/* Core App */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute>
                  <Verification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <MatchResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches/:matchId"
              element={
                <ProtectedRoute>
                  <MatchDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/active-ride/:requestId"
              element={
                <ProtectedRoute>
                  <ActiveRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-ride-rating"
              element={
                <ProtectedRoute>
                  <PostRideRating />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-rides"
              element={
                <ProtectedRoute>
                  <MyRides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy-settings"
              element={
                <ProtectedRoute>
                  <PrivacySettings />
                </ProtectedRoute>
              }
            />

            {/* Admin Portal */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
