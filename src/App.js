import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import HomePage from "./pages/HomePage";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🌏</div>
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}

function ProfileRequiredRoute({ children }) {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState(undefined);

  useEffect(() => {
    if (!user) {
      setProfileExists(undefined);
      return;
    }

    setProfileExists(undefined);
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      setProfileExists(!!data);
    };

    fetchProfile();
  }, [user]);

  if (loading || (user && profileExists === undefined)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return profileExists ? children : <Navigate to="/profile-setup" replace />;
}

function ProfileSetupRoute({ children }) {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState(undefined);

  useEffect(() => {
    if (!user) {
      setProfileExists(undefined);
      return;
    }

    setProfileExists(undefined);
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      setProfileExists(!!data);
    };

    fetchProfile();
  }, [user]);

  if (loading || (user && profileExists === undefined)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return profileExists ? <Navigate to="/home" replace /> : children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/profile-setup"
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
      <Route path="*" element={<Navigate to="/auth" replace />} />
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
