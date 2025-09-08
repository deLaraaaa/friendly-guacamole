import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/accessService";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error("Token validation failed:", err);
        // Limpar tokens inválidos
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setUser(null);
        setError("Sessão inválida ou expirada.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []); // Removida a dependência [user] para evitar loops

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}
