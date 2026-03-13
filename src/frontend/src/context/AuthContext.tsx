import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface AuthContextType {
  isLoggedIn: boolean;
  isPremium: boolean;
  premiumExpiresAt: bigint | null;
  premiumPlan: string | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (mobile: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isPremium: false,
  premiumExpiresAt: null,
  premiumPlan: null,
  userProfile: null,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  // Initialise synchronously from localStorage so UI never shows Sign In to a logged-in user
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("ksrp_logged_in") === "true",
  );
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<bigint | null>(null);
  const [premiumPlan, setPremiumPlan] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("ksrp_admin") === "true",
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthState = useCallback(async () => {
    if (!actor) return;
    const localAdmin = localStorage.getItem("ksrp_admin") === "true";
    const loggedIn = localStorage.getItem("ksrp_logged_in") === "true";

    if (!loggedIn) {
      setIsLoggedIn(false);
      setIsAdmin(localAdmin);
      setIsLoading(false);
      return;
    }

    try {
      const [profile, premiumStatus, adminStatus, plan] = await Promise.all([
        actor.getCallerUserProfile(),
        actor.getUserPremiumStatus(),
        actor.isAdmin(),
        actor.getUserPremiumPlan(),
      ]);
      if (profile) {
        setIsLoggedIn(true);
        setUserProfile(profile);
        setIsPremium(premiumStatus[0]);
        setPremiumExpiresAt(premiumStatus[1] ?? null);
        setPremiumPlan(plan ?? null);
        setIsAdmin(adminStatus || localAdmin);
      } else {
        localStorage.removeItem("ksrp_logged_in");
        setIsLoggedIn(false);
        setIsAdmin(localAdmin);
      }
    } catch {
      localStorage.removeItem("ksrp_logged_in");
      setIsLoggedIn(false);
      setIsAdmin(localAdmin);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!isFetching) {
      loadAuthState();
    }
  }, [loadAuthState, isFetching]);

  const login = async (_mobile: string) => {
    localStorage.setItem("ksrp_logged_in", "true");
    setIsLoggedIn(true);
    await loadAuthState();
  };

  const logout = () => {
    localStorage.removeItem("ksrp_logged_in");
    localStorage.removeItem("ksrp_admin");
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsPremium(false);
    setPremiumExpiresAt(null);
    setPremiumPlan(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isPremium,
        premiumExpiresAt,
        premiumPlan,
        userProfile,
        isAdmin,
        isLoading,
        login,
        logout,
        refreshAuth: loadAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
