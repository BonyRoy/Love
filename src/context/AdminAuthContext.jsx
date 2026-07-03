import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  adminLogin,
  adminLogout,
  validateAdminSession,
} from "../supabase/adminService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    validateAdminSession().then((valid) => {
      if (active) {
        setIsAdmin(valid);
        setChecking(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (id, password) => {
    const ok = await adminLogin(id, password);
    if (ok) setIsAdmin(true);
    return ok;
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ isAdmin, checking, login, logout }),
    [isAdmin, checking, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
