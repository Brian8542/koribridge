import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import ProfileDetailPage from "./pages/ProfileDetailPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SplashScreen from "./pages/SplashScreen";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function ProfileRequiredRoute({ children }) {
  const { user, loading, profile } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile === null) return <Navigate to="/setup" replace />;
  return children;
}

function ProfileSetupRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/setup"
        element={
          <ProfileSetupRoute>
            <ProfileSetupPage />
          </ProfileSetupRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProfileRequiredRoute>
            <HomePage />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProfileRequiredRoute>
            <ProfileDetailPage />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/chat/:partnerId"
        element={
          <ProfileRequiredRoute>
            <ChatPage />
          </ProfileRequiredRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
