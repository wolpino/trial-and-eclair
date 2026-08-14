import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  patchCurrentUser,
  registerUser,
  startDeveloperTrial,
  type LoginInput,
  type RegisterInput,
  type User,
} from "../api/client";
import { hasDeveloperAccess } from "./access";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasDeveloperAccess: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Pick<User, "show_forks">) => Promise<User>;
  startTrial: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && err instanceof ApiError && err.status === 403) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const loggedInUser = await loginUser(input);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const registeredUser = await registerUser(input);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Pick<User, "show_forks">) => {
    const updated = await patchCurrentUser(data);
    setUser(updated);
    return updated;
  }, []);

  const startTrial = useCallback(async () => {
    const updated = await startDeveloperTrial();
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      hasDeveloperAccess: user ? hasDeveloperAccess(user) : false,
      login,
      register,
      logout,
      updateProfile,
      startTrial,
    }),
    [user, loading, login, register, logout, updateProfile, startTrial],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
