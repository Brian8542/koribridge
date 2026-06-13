import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateLastSeen = async (userId) => {
    if (!userId) return;
    try {
      await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Failed to update last_seen_at:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      supabase.auth.storage = window.localStorage;
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser?.id) updateLastSeen(sessionUser.id);
      setLoading(false);
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser?.id) updateLastSeen(sessionUser.id);
    });

    const handleBeforeUnload = () => {
      if (typeof window === "undefined") return;

      const rememberMeValue = window.localStorage.getItem("rememberMe");
      const rememberMe = rememberMeValue === null ? true : rememberMeValue === "true";
      if (!rememberMe) {
        window.localStorage.removeItem("supabase.auth.token");
        supabase.auth.signOut().catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user?.id) {
      await updateLastSeen(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
