import React, { createContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    // Normalize role to Title Case so "management" == "Management" == "MANAGEMENT"
    if (userData?.role) {
      const r = userData.role.trim();
      userData.role = r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};