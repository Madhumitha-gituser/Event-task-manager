import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import ViewEvents from './pages/ViewEvents';
import CalendarPage from './pages/CalendarPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ManageEvent from './pages/ManageEvent';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return<Layout>{ children }</Layout>;
}

export default function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-event"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-events"
        element={
          <ProtectedRoute>
            <ViewEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute>
            <ActivityLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <ManageEvent />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </div>
  );
}
