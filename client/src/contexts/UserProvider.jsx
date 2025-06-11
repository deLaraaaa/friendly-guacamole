import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/accessService";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setError("Sessão inválida ou expirada.");
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}
