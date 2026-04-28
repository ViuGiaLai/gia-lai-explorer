import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function applyAuthState(nextSession: Session | null) {
      const id = ++requestId;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        if (active && id === requestId) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const admin = await checkAdmin(nextSession.user.id);
      if (active && id === requestId) {
        setIsAdmin(admin);
        setLoading(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applyAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data }) => applyAuthState(data.session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function checkAdmin(userId: string) {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return !!data;
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? window.location.origin + "/admin"
            : undefined
      }
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
