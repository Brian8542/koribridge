import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfileDetailPage from "./pages/ProfileDetailPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SplashScreen from "./pages/SplashScreen";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminPage from "./pages/AdminPage";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    </div>
  );
}

function ProfileRequiredRoute({ children }) {
  const { user, loading, profile } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile === null) return <Navigate to="/setup" replace />;
  return children;
}

function ProfileSetupRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/setup" element={<ProfileSetupRoute><ProfileSetupPage /></ProfileSetupRoute>} />
      <Route path="/home" element={<ProfileRequiredRoute><HomePage /></ProfileRequiredRoute>} />
      <Route path="/profile/:id" element={<ProfileRequiredRoute><ProfileDetailPage /></ProfileRequiredRoute>} />
      <Route path="/chat/:partnerId" element={<ProfileRequiredRoute><ChatPage /></ProfileRequiredRoute>} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/admin" element={<ProfileRequiredRoute><AdminPage /></ProfileRequiredRoute>} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
