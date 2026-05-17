import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as authApi from "../api/auth";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const reloadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    try {
      const profile = await authApi.me();
      if (mounted.current) setUser(profile);
    } catch (_err) {
      if (mounted.current) {
        clearTokens();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      await reloadUser();
      if (mounted.current) setIsLoading(false);
    })();
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => {
      mounted.current = false;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, [reloadUser]);

  const login = useCallback(async (email, password) => {
    const tokens = await authApi.login({ email, password });
    setTokens(tokens);
    await reloadUser();
  }, [reloadUser]);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    setTokens({ access: response.access, refresh: response.refresh });
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await authApi.logout({ refresh });
      } catch (_err) {
        // se ignora — los tokens se borran igual
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      reloadUser,
    }),
    [user, isLoading, login, register, logout, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
