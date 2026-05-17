import { createContext, useContext, useMemo } from "react";

const notImplemented = async () => {
  throw new Error("AuthContext: not wired yet (lands in iter-1)");
};

const defaultValue = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  login: notImplemented,
  register: notImplemented,
  logout: notImplemented,
  reloadUser: notImplemented,
};

const AuthContext = createContext(defaultValue);

export function AuthProvider({ children }) {
  const value = useMemo(() => defaultValue, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
