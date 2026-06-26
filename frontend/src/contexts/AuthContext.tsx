import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/config";
import { toast } from "sonner";
import type { Profile } from "@/integrations/firebase/types";

type AuthCtx = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserMeta = async (uid: string) => {
    try {
      // Load profile
      const profileRef = doc(db, "profiles", uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setProfile({ id: profileSnap.id, ...profileSnap.data() } as Profile);
      } else {
        setProfile(null);
      }

      // Load role
      const rolesQ = query(
        collection(db, "user_roles"),
        where("user_id", "==", uid)
      );
      const rolesSnap = await getDocs(rolesQ);
      const admin = rolesSnap.docs.some((d) => d.data().role === "admin");
      setIsAdmin(admin);
    } catch (err) {
      console.error("Failed to load user meta:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserMeta(firebaseUser.uid);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadUserMeta(user.uid);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setIsAdmin(false);
    toast.success("Logged out");
  };

  return (
    <Ctx.Provider value={{ user, profile, isAdmin, loading, signOut, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
