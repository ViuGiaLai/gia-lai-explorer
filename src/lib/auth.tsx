
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
-    // Set up listener FIRST
-    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
+    let isMounted = true;
+    let roleCheckVersion = 0;
+
+    const applySessionState = (newSession: Session | null) => {
       setSession(newSession);
       setUser(newSession?.user ?? null);
-      if (newSession?.user) {
-        // Defer role check to avoid deadlock
-        setTimeout(() => {
-          checkAdmin(newSession.user.id);
-        }, 0);
-      } else {
+    };
+
+    const syncAdminRole = async (newSession: Session | null) => {
+      const currentVersion = ++roleCheckVersion;
+
+      if (!newSession?.user) {
+        if (isMounted && currentVersion === roleCheckVersion) {
+          setIsAdmin(false);
+          setLoading(false);
+        }
+        return;
+      }
+
+      const admin = await checkAdmin();
+      if (isMounted && currentVersion === roleCheckVersion) {
+        setIsAdmin(admin);
+        setLoading(false);
+      }
+    };
+
+    // Set up listener FIRST
+    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
+      // Avoid potential Supabase deadlocks: don't await other Supabase calls directly in this callback.
+      applySessionState(newSession);
+
+      if (!newSession?.user) {
         setIsAdmin(false);
+        setLoading(false);
+        return;
       }
+
+      // Token refresh doesn't change role, avoid excessive role checks.
+      if (event === "TOKEN_REFRESHED") return;
+
+      setLoading(true);
+      setTimeout(() => {
+        void syncAdminRole(newSession);
+      }, 0);
     });
 
     // Then check existing session
-    supabase.auth.getSession().then(({ data }) => {
-      setSession(data.session);
-      setUser(data.session?.user ?? null);
-      if (data.session?.user) {
-        checkAdmin(data.session.user.id);
-      }
-      setLoading(false);
+    supabase.auth.getSession().then(async ({ data }) => {
+      if (!isMounted) return;
+      setLoading(true);
+      applySessionState(data.session);
+      await syncAdminRole(data.session);
     });
 
-    return () => subscription.unsubscribe();
+    return () => {
+      isMounted = false;
+      subscription.unsubscribe();
+    };
   }, []);
 
-  async function checkAdmin(userId: string) {
+  async function checkAdmin() {
     // Use the has_role function - it uses auth.uid() internally
     const { data, error } = await supabase.rpc("has_role", { 
       check_role: "admin" 
     });
     if (error) {
       console.error("Error checking admin role:", error);
-      setIsAdmin(false);
-      return;
+      return false;
     }
-    setIsAdmin(!!data);
+    return !!data;
   }
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error: error?.message ?? null };
   };
 
   const signUp = async (email: string, password: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/admin" : undefined },
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
