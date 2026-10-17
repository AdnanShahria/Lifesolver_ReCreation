import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './_core/queryClient';
import { AuthProvider } from './_core/AuthContext';
import { AIProvider } from './_core/AIContext';
import { LanguageProvider } from './_core/LanguageContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AIProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </AIProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
