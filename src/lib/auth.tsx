"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase-browser";

type Profile = {
  tier: "free" | "pro" | "admin";
  is_pro: boolean;
  is_admin: boolean;
  email: string | null;
} | null;

type AuthState = {
  user: { id: string; email: string | null } | null;
  profile: Profile;
  loading: boolean;
  isPro: boolean;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  isPro: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser({ id: user.id, email: user.email ?? null });

    const { data } = await supabase
      .from("profiles")
      .select("tier, is_pro, is_admin, email")
      .eq("id", user.id)
      .single();

    setProfile((data as Profile) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const isPro =
    !!profile?.is_pro || profile?.tier === "pro" || profile?.tier === "admin";

  return (
    <AuthCtx.Provider value={{ user, profile, loading, isPro, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
