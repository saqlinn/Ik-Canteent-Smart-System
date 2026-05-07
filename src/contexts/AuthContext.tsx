import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  register_no: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  phone: string | null;
  active_session_id: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const SESSION_KEY = "ik_session_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserMeta = async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof as Profile | null);
    const admin = (roles ?? []).some((r: any) => r.role === "admin");
    setIsAdmin(admin);

    // Single-session enforcement
    const localSid = localStorage.getItem(SESSION_KEY);
    if (prof && localSid && prof.active_session_id && prof.active_session_id !== localSid) {
      toast.error("Logged in on another device");
      await supabase.auth.signOut();
      localStorage.removeItem(SESSION_KEY);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => loadUserMeta(sess.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadUserMeta(s.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadUserMeta(user.id);
  };

  const signOut = async () => {
    if (user && profile) {
      await supabase.from("profiles").update({ active_session_id: null }).eq("user_id", user.id);
    }
    localStorage.removeItem(SESSION_KEY);
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  return (
    <Ctx.Provider value={{ user, session, profile, isAdmin, loading, signOut, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
