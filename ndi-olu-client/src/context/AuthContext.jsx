import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("ndi_olu_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("ndi_olu_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Authentication failed.");
        }

        setUser(data.user);

        localStorage.setItem(
          "ndi_olu_user",
          JSON.stringify(data.user),
        );
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("ndi_olu_token");
        localStorage.removeItem("ndi_olu_user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function login(data) {
    localStorage.setItem("ndi_olu_token", data.token);
    localStorage.setItem("ndi_olu_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("ndi_olu_token");
    localStorage.removeItem("ndi_olu_user");

    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}