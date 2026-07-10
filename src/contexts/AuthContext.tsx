import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { silentRefresh, logoutUser } from "../lib/auth";
import { tokenStore } from "../lib/tokenStore";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  outletId: string | null;
  logout: () => Promise<void>;
  onLoginSuccess: (accessToken: string, outletId?: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [outletId, setOutletId] = useState<string | null>(null);

  useEffect(() => {
    silentRefresh()
      .then((data) => {
        tokenStore.set(data.accessToken);
        if (data.outletId) {
          setOutletId(data.outletId);
        }
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    await logoutUser();
    setOutletId(null);
    setIsAuthenticated(false);
  };

  const onLoginSuccess = (accessToken: string, assignedOutletId?: string | null) => {
    tokenStore.set(accessToken);
    if (assignedOutletId) {
      setOutletId(assignedOutletId);
    }
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, outletId, logout, onLoginSuccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
