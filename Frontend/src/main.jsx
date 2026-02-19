import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

// Pages / Components
import App from "./App.jsx";        // Login page
import Home from "./Home.jsx";      // Dashboard
import Learning from "./Learning.jsx";
import Navbar from "./Navbar.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import NotFound from "./NotFound.jsx";
import Gaming from "./Gaming.jsx";
import Sports from "./Sports.jsx";
import LessonPage from "./LessonPage";
import Profile from "./Profile.jsx";
import ProgressHub from "./ProgressHub.jsx";




// Layout for protected pages (shows Navbar)
function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<App />} />

        {/* Protected */}
        <Route
          path="/home"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/home/learning"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <Learning />
              </ProtectedLayout>
            </AuthGuard>
          }
        />

        {/* 🔥 ADD THIS */}
        <Route
          path="/home/learning/lesson/:id"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <LessonPage />
              </ProtectedLayout>
            </AuthGuard>
          }
        />

        <Route
        path="/home/gaming"
        element={
          <AuthGuard>
            <ProtectedLayout>
              <Gaming />
            </ProtectedLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/home/sports"
        element={
          <AuthGuard>
            <ProtectedLayout>
              <Sports />
            </ProtectedLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/home/profile"
        element={
          <AuthGuard>
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/home/hub"
        element={
          <AuthGuard>
            <ProtectedLayout>
              <ProgressHub />
            </ProtectedLayout>
          </AuthGuard>
        }
      />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
