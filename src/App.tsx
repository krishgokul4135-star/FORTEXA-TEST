/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from './types';
import WelcomePage from './components/WelcomePage';
import AuthPortal from './components/AuthPortal';
import Dashboard from './components/Dashboard';
import AcademicRecords from './components/AcademicRecords';
import QuizEngine from './components/QuizEngine';
import AssociationEvents from './components/AssociationEvents';
import FundManager from './components/FundManager';

export default function App() {
  // Navigation states: 'welcome' | 'auth' | 'dashboard' | 'academics' | 'quizzes' | 'association' | 'funds'
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Retrieve cached session on reload if it exists
  useEffect(() => {
    const cachedUser = localStorage.getItem('CYBER_USER');
    const cachedToken = localStorage.getItem('CYBER_TOKEN');
    const cachedView = localStorage.getItem('CYBER_VIEW');
    
    if (cachedUser && cachedToken) {
      setUser(JSON.parse(cachedUser));
      setToken(cachedToken);
      setCurrentView(cachedView || 'dashboard');
    }
  }, []);

  // Set session persistence
  const handleLoginSuccess = (authenticatedUser: User, sessionToken: string) => {
    setUser(authenticatedUser);
    setToken(sessionToken);
    localStorage.setItem('CYBER_USER', JSON.stringify(authenticatedUser));
    localStorage.setItem('CYBER_TOKEN', sessionToken);
    localStorage.setItem('CYBER_VIEW', 'dashboard');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('CYBER_USER');
    localStorage.removeItem('CYBER_TOKEN');
    localStorage.removeItem('CYBER_VIEW');
    setCurrentView('welcome');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('CYBER_VIEW', view);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      {/* Landscape lock advisory: Show a friendly banner on ultra-narrow portrait views */}
      <div className="block sm:hidden bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] py-2 px-3 text-center uppercase tracking-widest font-mono z-50 relative">
        ★ Optimize View: Rotate your device to Landscape mode for high-fidelity cybersecurity console matrices.
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <WelcomePage onEnter={() => handleNavigate('auth')} />
            </motion.div>
          )}

          {currentView === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AuthPortal
                onBack={() => handleNavigate('welcome')}
                onLoginSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'academics' && user && (
            <motion.div
              key="academics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AcademicRecords
                user={user}
                onBack={() => handleNavigate('dashboard')}
              />
            </motion.div>
          )}

          {currentView === 'quizzes' && user && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <QuizEngine
                user={user}
                onBack={() => handleNavigate('dashboard')}
              />
            </motion.div>
          )}

          {currentView === 'association' && user && (
            <motion.div
              key="association"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AssociationEvents
                user={user}
                onBack={() => handleNavigate('dashboard')}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'funds' && user && (
            <motion.div
              key="funds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FundManager
                user={user}
                onBack={() => handleNavigate('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cyber Security Footprint - Elegant Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 font-sans select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Smart Entry to Cyber Web Portal. All rights reserved.</span>
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">DEPARTMENT OF COMPUTER SCIENCE ENGINEERING (CYBERSECURITY)</span>
        </div>
      </footer>
    </div>
  );
}
