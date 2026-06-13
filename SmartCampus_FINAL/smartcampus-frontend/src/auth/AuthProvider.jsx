import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me, logout as apiLogout } from "../api/auth";

const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const u = await me();
      setUser(u);
      setReady(true);
      return u;
    } catch {
      setUser(null);
      setReady(true);
      return null;
    }
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ user, ready, refresh, logout }), [user, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}