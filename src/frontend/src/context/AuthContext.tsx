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
  userProfile: null,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<bigint | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthState = useCallback(async () => {
    if (!actor || isFetching) return;
    const loggedIn = localStorage.getItem("ksrp_logged_in") === "true";
    if (!loggedIn) {
      setIsLoading(false);
      return;
    }
    try {
      const [profile, premiumStatus, adminStatus] = await Promise.all([
        actor.getCallerUserProfile(),
        actor.getUserPremiumStatus(),
        actor.isAdmin(),
      ]);
      if (profile) {
        setIsLoggedIn(true);
        setUserProfile(profile);
        setIsPremium(premiumStatus[0]);
        setPremiumExpiresAt(premiumStatus[1] ?? null);
        setIsAdmin(adminStatus);
      } else {
        localStorage.removeItem("ksrp_logged_in");
      }
    } catch {
      localStorage.removeItem("ksrp_logged_in");
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const login = async (_mobile: string) => {
    localStorage.setItem("ksrp_logged_in", "true");
    await loadAuthState();
  };

  const logout = () => {
    localStorage.removeItem("ksrp_logged_in");
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsPremium(false);
    setPremiumExpiresAt(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isPremium,
        premiumExpiresAt,
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
