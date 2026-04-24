import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DietPlan from "./pages/DietPlan";
import WorkoutTracker from "./pages/WorkoutTracker";
import PoseDetector from "./pages/PoseDetector";
import Progress from "./pages/Progress";
import Layout from "./components/Layout";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/diet"        element={<DietPlan />} />
          <Route path="/workout"     element={<WorkoutTracker />} />
          <Route path="/pose"        element={<PoseDetector />} />
          <Route path="/progress"    element={<Progress />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
