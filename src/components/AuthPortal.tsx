/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, User, Lock, Mail, RefreshCw, Key, HelpCircle, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';

interface AuthPortalProps {
  onBack: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AuthPortal({ onBack, onLoginSuccess }: AuthPortalProps) {
  // Staff inputs
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  // Student inputs
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Individual forgot password states
  const [staffShowForgot, setStaffShowForgot] = useState(false);
  const [staffForgotEmail, setStaffForgotEmail] = useState('');
  const [staffForgotSuccess, setStaffForgotSuccess] = useState('');
  const [staffForgotError, setStaffForgotError] = useState('');

  const [studentShowForgot, setStudentShowForgot] = useState(false);
  const [studentForgotEmail, setStudentForgotEmail] = useState('');
  const [studentForgotSuccess, setStudentForgotSuccess] = useState('');
  const [studentForgotError, setStudentForgotError] = useState('');
  
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Authentication submit
  const handleLogin = async (role: UserRole) => {
    setLoginError('');
    setIsLoading(true);
    
    const username = role === 'staff' ? staffUsername : studentUsername;
    const password = role === 'staff' ? staffPassword : studentPassword;

    if (!username || !password) {
      setLoginError('Security Protocol Alert: Both Username and Cryptographic Password are required.');
      setIsLoading(false);
      return;
    }

    // Enforce Username pattern: [Name].[Initial]
    const usernameRegex = /^[A-Za-z]+\.[A-Za-z]+$/;
    if (!usernameRegex.test(username)) {
      setLoginError('Format Error: Username must contain a name, followed by a dot (.), and then the initial (e.g., Gokul.P).');
      setIsLoading(false);
      return;
    }

    // Enforce Password pattern: 149[Special_Character][3_Digits]
    const passwordRegex = /^149[^a-zA-Z0-9]\d{3}$/;
    if (!passwordRegex.test(password)) {
      setLoginError('Format Error: Password must strictly start with department code 149, followed by any special character, and end with exactly 3 digits (e.g., 149@789).');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failure.');
      }

      // Successful login
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setLoginError(err.message || 'System error communicating with auth server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Inline Forgot Password Email Handler
  const handleForgotPasswordSubmit = async (role: UserRole) => {
    const email = role === 'staff' ? staffForgotEmail : studentForgotEmail;
    const setSuccess = role === 'staff' ? setStaffForgotSuccess : setStudentForgotSuccess;
    const setError = role === 'staff' ? setStaffForgotError : setStudentForgotError;

    setSuccess('');
    setError('');

    if (!email || !email.includes('@')) {
      setError('Format Error: Registered email is invalid.');
      return;
    }

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Recovery transmission failure.');
      }
      setSuccess(data.message);
      if (role === 'staff') {
        setStaffForgotEmail('');
      } else {
        setStudentForgotEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing OTP recovery vector.');
    }
  };

  // Handle Email Recovery
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMessage('');
    
    if (!recoveryEmail) {
      setRecoveryError('Registered email is strictly required for recovery.');
      return;
    }

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Recovery transmission failure.');
      }
      setRecoveryMessage(data.message);
      setRecoveryEmail('');
    } catch (err: any) {
      setRecoveryError(err.message || 'Error executing OTP recovery vector.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 font-sans px-4 py-8 md:px-12 flex flex-col justify-center overflow-hidden">
      {/* Background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
      
      {/* Top Banner & Return */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO DIRECTORY</span>
        </button>

        <div className="flex items-center space-x-2 text-orange-600 text-xs font-bold font-mono">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span className="tracking-wider">SECURE AUTHORIZATION ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Separated for Staff and Student Portals in widescreen Landscape */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-6">
        
        {/* Left Side: Staff Portal (Blue accent) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-md hover:shadow-lg transition-all relative overflow-hidden"
        >
          {/* Top-Right Decorator */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent pointer-events-none"></div>
          
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-blue-600 tracking-wider">STAFF PORTAL</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Faculty, Admin, & Registrar Node</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
              Authorized administrative gateway. Connect with regulation tracking databases, audit student records, verify financial transaction logs, and configure exams.
            </p>

            {/* Input fields */}
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="block text-[11px] text-slate-700 uppercase tracking-wider mb-1.5 font-bold">Staff Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="e.g., Carter.E"
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Format: [Name].[Initial] (e.g. Gokul.P)</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 uppercase tracking-wider mb-1.5 font-bold">Cryptographic Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin('staff')}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Format: 149[Special_Char][3_Digits] (e.g. 149@789)</p>
                
                {/* Forgot Password Link and Inline Flow */}
                <div className="mt-3 flex flex-col items-start">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffShowForgot(!staffShowForgot);
                      setStaffForgotError('');
                      setStaffForgotSuccess('');
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer tracking-wider flex items-center space-x-1 uppercase font-semibold"
                  >
                    <span>Forgot Password?</span>
                  </button>
                  <AnimatePresence>
                    {staffShowForgot && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full overflow-hidden mt-2 border border-blue-100 bg-blue-50/50 p-3 rounded-lg"
                      >
                        <p className="text-[9px] text-slate-500 uppercase mb-1.5 font-bold">Registered Email Verification</p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Enter Registered Email ID"
                            value={staffForgotEmail}
                            onChange={(e) => setStaffForgotEmail(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleForgotPasswordSubmit('staff')}
                            className="px-4 py-1.5 bg-blue-600 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-blue-700 transition-all cursor-pointer border-none"
                          >
                            Send
                          </button>
                        </div>
                        {staffForgotSuccess && (
                          <p className="text-[10px] text-teal-600 mt-2 font-bold">{staffForgotSuccess}</p>
                        )}
                        {staffForgotError && (
                          <p className="text-[10px] text-orange-600 mt-2 font-bold">{staffForgotError}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <button
            id="login-staff-button"
            onClick={() => handleLogin('staff')}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm border-none"
          >
            {isLoading ? 'VERIFYING CREDENTIALS...' : 'STAFF LOGIN'}
          </button>
        </motion.div>

        {/* Right Side: Student Portal (Teal accent) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-md hover:shadow-lg transition-all relative overflow-hidden"
        >
          {/* Top-Right Decorator */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-50 to-transparent pointer-events-none"></div>

          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-teal-600 tracking-wider">STUDENT PORTAL</h2>
                <p className="text-[10px] text-teal-600 uppercase tracking-wider font-mono font-bold">Academic Portal Node</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
              Authorized student gateway. Access active course schedules, verify your academic timeline, take assessment quizzes, and submit financial transmittals for event registrations.
            </p>

            {/* Input fields */}
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="block text-[11px] text-slate-700 uppercase tracking-wider mb-1.5 font-bold">Student Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="e.g., Alice.J"
                    className="w-full bg-white border border-slate-300 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Format: [Name].[Initial] (e.g. Alice.J)</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 uppercase tracking-wider mb-1.5 font-bold">Cryptographic Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin('student')}
                    className="w-full bg-white border border-slate-300 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Format: 149[Special_Char][3_Digits] (e.g. 149#123)</p>
                
                {/* Forgot Password Link and Inline Flow */}
                <div className="mt-3 flex flex-col items-start">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentShowForgot(!studentShowForgot);
                      setStudentForgotError('');
                      setStudentForgotSuccess('');
                    }}
                    className="text-[10px] text-teal-600 hover:text-teal-800 hover:underline cursor-pointer tracking-wider flex items-center space-x-1 uppercase font-semibold"
                  >
                    <span>Forgot Password?</span>
                  </button>
                  <AnimatePresence>
                    {studentShowForgot && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full overflow-hidden mt-2 border border-teal-100 bg-teal-50/50 p-3 rounded-lg"
                      >
                        <p className="text-[9px] text-slate-500 uppercase mb-1.5 font-bold">Registered Email Verification</p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Enter Registered Email ID"
                            value={studentForgotEmail}
                            onChange={(e) => setStudentForgotEmail(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 focus:border-teal-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleForgotPasswordSubmit('student')}
                            className="px-4 py-1.5 bg-teal-600 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-teal-700 transition-all cursor-pointer border-none"
                          >
                            Send
                          </button>
                        </div>
                        {studentForgotSuccess && (
                          <p className="text-[10px] text-teal-600 mt-2 font-bold">{studentForgotSuccess}</p>
                        )}
                        {studentForgotError && (
                          <p className="text-[10px] text-orange-600 mt-2 font-bold">{studentForgotError}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <button
            id="login-student-button"
            onClick={() => handleLogin('student')}
            disabled={isLoading}
            className="w-full py-3 bg-teal-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-teal-700 rounded-lg transition-all cursor-pointer shadow-sm border-none"
          >
            {isLoading ? 'VERIFYING CREDENTIALS...' : 'STUDENT LOGIN'}
          </button>
        </motion.div>

      </div>

      {/* Global Error Banner if any */}
      {loginError && (
        <div className="max-w-7xl mx-auto w-full mb-6">
          <div className="border border-orange-200 bg-orange-50 text-orange-800 p-4 rounded-lg text-xs flex items-center space-x-2 shadow-sm font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span className="font-semibold">{loginError}</span>
          </div>
        </div>
      )}

    </div>
  );
}
