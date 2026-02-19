import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api.js";

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.auth}/me`, { credentials: "include" })
      .then(res => {
        if (res.status === 200) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthed(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: "#334155" }}>Loading...</div>;
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
