import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './_core/AuthContext';
import { LandingPage } from './Landing/LandingPage';
import { QuickDashboardView } from './Dashboard/QuickDashboardView';
import { AuthPage } from './Auth/AuthPage';
import { FinancePage } from './Finance';
import { PlannerPage } from './Planner/PlannerPage';
import { VerticalPlaceholderPage } from './_core/VerticalPlaceholderPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <LandingPage 
            onEnterDashboard={() => navigate(isAuthenticated ? '/dashboard' : '/auth')} 
          />
        } 
      />
      
      {/* ── Dedicated /auth Hub with All Linked Modes ── */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* ── Direct Convenience Aliases Linked to /auth ── */}
      <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
      <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
      <Route path="/verify-otp" element={<Navigate to="/auth?mode=verify-otp" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/auth?mode=forgot-password" replace />} />
      <Route path="/reset-password" element={<Navigate to="/auth?mode=reset-password" replace />} />
      
      {/* ── Protected / Executive Dashboard View ── */}
      <Route 
        path="/dashboard" 
        element={
          <QuickDashboardView onBackToLanding={() => navigate('/')} />
        } 
      />

      {/* ── Vertical 1: Planner OS ── */}
      <Route path="/planner" element={<PlannerPage />} />

      {/* ── Vertical 2: Mind OS ── */}
      <Route path="/mind" element={<VerticalPlaceholderPage />} />

      {/* ── Vertical 3: Finance OS ── */}
      <Route 
        path="/finance" 
        element={
          isAuthenticated ? <FinancePage /> : <Navigate to="/auth?mode=login" replace />
        } 
      />

      {/* ── Vertical 4: Health OS ── */}
      <Route path="/health" element={<VerticalPlaceholderPage />} />

      {/* ── Vertical 5: Focus OS ── */}
      <Route path="/focus" element={<VerticalPlaceholderPage />} />

      {/* ── Vertical 6: Assets OS ── */}
      <Route path="/assets" element={<VerticalPlaceholderPage />} />

      {/* ── Vertical 7: Network OS ── */}
      <Route path="/network" element={<VerticalPlaceholderPage />} />

      {/* ── Vertical 8: Copilot OS ── */}
      <Route path="/copilot" element={<VerticalPlaceholderPage />} />

      {/* ── System & Utilities ── */}
      <Route path="/admin" element={<VerticalPlaceholderPage />} />
      <Route path="/sysadmin" element={<VerticalPlaceholderPage />} />
      <Route path="/settings" element={<VerticalPlaceholderPage />} />
      <Route path="/support" element={<VerticalPlaceholderPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
