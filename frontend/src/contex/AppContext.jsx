import { useState, useEffect, useCallback } from "react";
import { authApi } from "../router/auth/Signup";
import { AppContext } from "./useAppContext";

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const getUserData = useCallback(async () => {
    try {
      const result = await authApi.getCurrentUser();
      if (result?.status==200 ) {
        setUser(result?.data?.user || result?.data);
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    isAuth,
    setIsAuth,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
