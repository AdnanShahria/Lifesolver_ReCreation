import React, { useState } from 'react';
import { useAuth } from './_core/AuthContext';
import { LandingPage } from './Landing/LandingPage';
import { QuickDashboardView } from './Dashboard/QuickDashboardView';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  // If user is authenticated and explicitly entered dashboard view
  if (isAuthenticated && currentView === 'dashboard') {
    return <QuickDashboardView onBackToLanding={() => setCurrentView('landing')} />;
  }

  // Default: Pristine, Apple-Grade Landing Page (Before page of login)
  return <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />;
}
