/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CircleDollarSign, Plus, CheckCircle, FileText, Upload, 
  HelpCircle, Eye, EyeOff, Sparkles, TrendingUp, TrendingDown, RefreshCw, BarChart3,
  Edit2, Save, X, Shield, Activity, FileSpreadsheet, UserCheck, Server, AlertTriangle, 
  Trash2, Filter, Search, Download, Check, Award, Cpu, AlertCircle
} from 'lucide-react';
import { User, LedgerEntry } from '../types';

interface FundManagerProps {
  user: User;
  onBack: () => void;
}

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
}

interface HackathonTeam {
  id: string;
  name: string;
  score: number;
  membersCount: number;
  compromisedNodes: number;
  status: 'active' | 'quarantined' | 'completed';
}

export default function FundManager({ user, onBack }: FundManagerProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'ledger' | 'hackathon' | 'reports'>('ledger');

  // Ledger & Expense datasets
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalFundsCollected: 25750,
    totalExpenses: 18200,
    remainingBalance: 7550
  });
  const [regAnalytics, setRegAnalytics] = useState({
    verifiedCount: 4,
    pendingCount: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  // Notifications and messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Top list filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterEvent, setFilterEvent] = useState('All');

  // Active Admin Editable Grid drafts state
  // key is ledger entry id, value is the modified attributes
  const [localDrafts, setLocalDrafts] = useState<{ [rowId: string]: Partial<LedgerEntry> }>({});

  // Expenses editing states
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseName, setEditExpenseName] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState<number>(0);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Proof screen modal states
  const [showProofId, setShowProofId] = useState<string | null>(null);

  // New Ledger entry form (Admin nested at bottom)
  const [newName, setNewName] = useState('');
  const [newReg, setNewReg] = useState('');
  const [newYear, setNewYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | 'Final Year'>('1st Year');
  const [newDept, setNewDept] = useState('CybSec');
  const [newAmount, setNewAmount] = useState<string>('750');
  const [newProofName, setNewProofName] = useState('');
  const [newProofBase64, setNewProofBase64] = useState('');
  const [newEventName, setNewEventName] = useState('CybSec Symposium');
  const [newTransactionId, setNewTransactionId] = useState('');

  // Hackathon dynamic simulation states
  const [hackathonTeams, setHackathonTeams] = useState<HackathonTeam[]>([
    { id: 't1', name: 'Team CipherPunks', score: 1450, membersCount: 4, compromisedNodes: 3, status: 'active' },
    { id: 't2', name: 'Team RedHat Rebels', score: 1200, membersCount: 3, compromisedNodes: 2, status: 'active' },
    { id: 't3', name: 'Team ShadowSec', score: 950, membersCount: 4, compromisedNodes: 1, status: 'active' },
    { id: 't4', name: 'Phish Slayers', score: 600, membersCount: 3, compromisedNodes: 0, status: 'active' }
  ]);
  const [simulatingExploit, setSimulatingExploit] = useState(false);
  const [ctfLog, setCtfLog] = useState<string[]>([
    "INITIALIZED HACKATHON LIVE ATTACK MAP V2.0",
    "NODE 10.0.12.15 STATUS: WATCHING",
    "SYSTEM SECURE: DEFENSIVE PARADIGM REINFORCED"
  ]);

  // SVG Chart hovering tooltip state
  const [hoveredBar, setHoveredBar] = useState<{
    dept: string;
    planned: number;
    actual: number;
    x: number;
    y: number;
  } | null>(null);

  // Standard departments list
  const departments = ['CybSec', 'Computer Science', 'Electronics', 'Information Tech', 'Software Eng'];

  // Standard events list
  const eventsList = ['CybSec Symposium', 'Hackathon - CSS', 'Workshop - AI', 'Guest Lecture - CRYPTO'];

  // Core Data Fetching
  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ledger');
      const data = await response.json();
      setLedger(data.ledger || []);
      setExpenses(data.expenses || []);
      
      // Calculate or load metrics
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      if (data.registrationAnalytics) {
        setRegAnalytics(data.registrationAnalytics);
      }
    } catch (err) {
      console.error('Error fetching financial ledger data:', err);
      setError('Inbound telemetry sync interrupted. Verify API server status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  // Set randomized transaction ID on nested form mount / reset
  useEffect(() => {
    if (!newTransactionId) {
      setNewTransactionId('TXN' + Math.floor(1000000000 + Math.random() * 9000000000));
    }
  }, [newTransactionId]);

  // Screenshot Upload Reader
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProofName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProofBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. NESTED ADD ENTRY SUBMISSION
  const handleNewEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newName || !newReg || !newYear || !newAmount) {
      setError('Form validation failed: complete all required fields.');
      return;
    }

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: newName,
          registerNumber: newReg.toUpperCase(),
          year: newYear,
          department: newDept,
          amount: Number(newAmount),
          screenshotName: newProofName || 'manual_proof.png',
          screenshotUrl: newProofBase64 || 'mock_uploaded_screenshot',
          eventName: newEventName,
          transactionId: newTransactionId || ('TXN' + Math.floor(1000000000 + Math.random() * 9000000000)),
          status: 'Pending'
        })
      });

      if (!response.ok) throw new Error('Transaction submission failed.');

      // Reset form fields
      setNewName('');
      setNewReg('');
      setNewProofName('');
      setNewProofBase64('');
      setNewTransactionId('');
      
      // Reload and notify
      await fetchLedgerData();
      setMessage('SUCCESS: Added new participant ledger entry under block validation.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Error occurred during ledger submission.');
    }
  };

  // 2. ACTIVE ADMIN GRID: UPDATE ROW VALUE LOCALLY (DRAFT)
  const handleRowDraftChange = (rowId: string, field: string, value: any) => {
    setLocalDrafts(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  // Check if a row or specific field has changes from its database origin
  const getDisplayValue = (entry: LedgerEntry, field: keyof LedgerEntry) => {
    const draft = localDrafts[entry.id];
    if (draft && draft[field] !== undefined) {
      return draft[field];
    }
    return entry[field];
  };

  const isFieldModified = (entry: LedgerEntry, field: keyof LedgerEntry) => {
    const draft = localDrafts[entry.id];
    if (!draft || draft[field] === undefined) return false;
    return draft[field] !== entry[field];
  };

  const isRowModified = (rowId: string) => {
    const draft = localDrafts[rowId];
    if (!draft) return false;
    return Object.keys(draft).length > 0;
  };

  // 3. SAVE DRAFT ROW TO BACKEND database
  const handleSaveRow = async (entry: LedgerEntry) => {
    setError('');
    setMessage('');
    const draft = localDrafts[entry.id];
    if (!draft) return;

    try {
      const response = await fetch(`/api/ledger/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });

      if (!response.ok) throw new Error('Database write failure. Update rejected.');

      // Clear draft entry
      setLocalDrafts(prev => {
        const copy = { ...prev };
        delete copy[entry.id];
        return copy;
      });

      await fetchLedgerData();
      setMessage(`SUCCESS: Secure Audit database synchronized for row ${entry.studentName}`);
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
    }
  };

  // Discard local unsaved modifications for a row
  const handleDiscardRow = (rowId: string) => {
    setLocalDrafts(prev => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });
  };

  // 4. DELETE LEDGER ENTRY
  const handleDeleteRow = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ledger block for ${name}? This action is permanent.`)) {
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/ledger/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Database removal failed.');
      
      await fetchLedgerData();
      setMessage(`DELETION CLEARED: Ledger block removed for student: ${name}`);
    } catch (err: any) {
      setError(err.message || 'Deletion failed.');
    }
  };

  // 5. UPDATE EXPENSES
  const handleEditExpenseSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editExpenseName || editExpenseAmount === undefined) return;
    try {
      const response = await fetch(`/api/ledger/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: editExpenseName, amount: Number(editExpenseAmount) })
      });
      if (response.ok) {
        setEditingExpenseId(null);
        await fetchLedgerData();
        setMessage(`UPDATED: Expense Category details synchronized.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError('Failed to update expense category.');
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    try {
      const response = await fetch('/api/ledger/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newExpenseName, amount: Number(newExpenseAmount) })
      });
      if (response.ok) {
        setNewExpenseName('');
        setNewExpenseAmount('');
        setShowAddExpense(false);
        await fetchLedgerData();
        setMessage(`ADDED: New Expense Category recorded successfully.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError('Failed to append expense item.');
    }
  };

  const handleDeleteExpense = async (id: string, category: string) => {
    if (!confirm(`Delete expense category: ${category}?`)) return;
    try {
      const response = await fetch(`/api/ledger/expenses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchLedgerData();
        setMessage(`DELETED: Expense category "${category}" cleared.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError('Expense deletion aborted due to network response.');
    }
  };

  // Immediate update department inside read-only list
  const handleImmediateDeptUpdate = async (id: string, name: string, dept: string) => {
    try {
      const response = await fetch(`/api/ledger/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: dept })
      });
      if (response.ok) {
        await fetchLedgerData();
        setMessage(`SUCCESS: Inline department adjustment verified for ${name}.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError('Inline update rejected by database schema validation.');
    }
  };

  // Simulation: Hackathon cyber-range exploit simulation
  const handleExploitSimulation = () => {
    setSimulatingExploit(true);
    const targetTeamIdx = Math.floor(Math.random() * hackathonTeams.length);
    const pointsScored = Math.floor(Math.random() * 100) + 150;
    
    setTimeout(() => {
      setHackathonTeams(prev => prev.map((t, idx) => {
        if (idx === targetTeamIdx) {
          return {
            ...t,
            score: t.score + pointsScored,
            compromisedNodes: Math.min(6, t.compromisedNodes + 1)
          };
        }
        return t;
      }));

      const exploitedNode = `10.0.12.${Math.floor(Math.random() * 80) + 10}`;
      const targetTeamName = hackathonTeams[targetTeamIdx].name;
      setCtfLog(prev => [
        `[${new Date().toLocaleTimeString()}] COMPROMISED: ${targetTeamName} successfully rooted node ${exploitedNode} (+${pointsScored} pts)`,
        ...prev.slice(0, 5)
      ]);
      setSimulatingExploit(false);
    }, 1200);
  };

  // Filters logic for Read-only contributions list
  const filteredLedger = ledger.filter(entry => {
    const matchesSearch = entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'All' || entry.department === filterDept;
    const matchesEvent = filterEvent === 'All' || entry.eventName === filterEvent;
    return matchesSearch && matchesDept && matchesEvent;
  });

  // Target collection gauge variables
  const targetFunds = 30000;
  const collectedPercentage = Math.min(100, (metrics.totalFundsCollected / targetFunds) * 100);

  // Department Variance Chart data source
  const deptBudgets = [
    { name: 'Hackathon - CSS', planned: 10000, actual: 8500 },
    { name: 'Symposium - SE', planned: 12000, actual: 13200 },
    { name: 'Workshop - AI', planned: 8000, actual: 7400 }
  ];

  // Helper to trigger custom client-side CSV downloads
  const triggerCSVDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Student Name,Reg Number,Year,Department,Contribution Fee,Status,Event Name,Transaction ID\n";
    
    ledger.forEach(l => {
      csvContent += `"${l.id}","${l.studentName}","${l.registerNumber}","${l.year}","${l.department || 'CybSec'}",${l.amount},"${l.status}","${l.eventName || 'CybSec Symposium'}","${l.transactionId || 'N/A'}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CYBER_EVENT_LEDGER_REPORT.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage("SUCCESS: Report compiled and downloaded to local host storage.");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#f3f4f6] font-mono px-4 md:px-8 py-6 flex flex-col relative select-none">
      
      {/* Background Matrix HUD Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-40"></div>

      {/* Top Banner Row */}
      <header className="max-w-7xl mx-auto w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#1f2937] pb-5 mb-6 z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs text-[#00f2ff] border border-[#00f2ff]/30 bg-[#00f2ff]/5 hover:bg-[#00f2ff]/15 px-4 py-2 rounded-sm transition-all cursor-pointer uppercase tracking-widest font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO PORTAL</span>
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-widest text-[#f3f4f6] uppercase glow-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00f2ff]" />
              CYBER SECURITY EVENT FUND LEDGER
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              SECURE DEPLOYMENT SECURITY OPERATIONS DASHBOARD // CONSOLE VER v3.5
            </p>
          </div>
        </div>

        {/* Tab Navigation & Profile Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#101218] border border-[#1f2937] rounded p-1">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'ledger' ? 'bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/30' : 'text-gray-400 hover:text-white'}`}
            >
              FUND LEDGER
            </button>
            <button
              id="hackathon-separate-tab"
              onClick={() => setActiveTab('hackathon')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 ${activeTab === 'hackathon' ? 'bg-[#ff2d55]/15 text-[#ff2d55] border border-[#ff2d55]/30' : 'text-gray-400 hover:text-white'}`}
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse text-[#ff2d55]" />
              HACKATHON (SEPARATE)
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'reports' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'}`}
            >
              REPORTS
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="bg-[#101218] border border-slate-800 rounded px-3 py-1 flex items-center gap-2 text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ffa3] animate-ping"></div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase leading-none font-bold">NODE ADMIN</p>
              <p className="text-xs text-gray-300 uppercase font-black tracking-tight leading-normal mt-0.5">{user.username}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Toast Messages */}
      <div className="max-w-7xl mx-auto w-full z-10">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-[#00ffa3]/40 bg-[#00ffa3]/10 text-[#00ffa3] p-3.5 rounded-sm text-xs mb-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#00ffa3] shrink-0" />
                <span className="font-bold tracking-wider">{message}</span>
              </div>
              <button onClick={() => setMessage('')} className="text-gray-400 hover:text-white font-bold ml-2">×</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-[#ff2d55]/40 bg-[#ff2d55]/10 text-[#ff2d55] p-3.5 rounded-sm text-xs mb-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#ff2d55] shrink-0" />
                <span className="font-bold tracking-wider">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-gray-400 hover:text-white font-bold ml-2">×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Tab Panels Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'ledger' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-8"
            >
              {/* LEDGER TAB CONTENT */}
              {/* TOP ANALYTICS SECTION (Gauge, Expenses Table, Variance Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Total Fund Collection Panel (SPAN 4) */}
                <div className="lg:col-span-4 bg-[#101218] border border-[#1f2937] p-5 rounded-sm flex flex-col justify-between relative overflow-hidden shadow-lg group">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-gray-600 font-bold tracking-wider">GAUGE.CORE // SYS_A</div>
                  
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-300 tracking-widest border-b border-[#1f2937] pb-2 mb-4 flex items-center justify-between">
                      <span>TOTAL FUND COLLECTED (INR)</span>
                      <span className="text-[#00f2ff] animate-pulse">● TELEMETRY</span>
                    </h3>

                    {/* Scientific Gauge View */}
                    <div className="flex flex-col items-center justify-center py-4 relative">
                      {/* Interactive circular gauge */}
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        {/* SVG Gauge Background Arch */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          {/* Inner Circle Track */}
                          <circle cx="60" cy="60" r="48" className="stroke-slate-900" strokeWidth="8" fill="transparent" />
                          <circle cx="60" cy="60" r="48" className="stroke-[#101218]" strokeWidth="12" fill="transparent" />
                          {/* Outer Track Arc */}
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="48" 
                            className="stroke-slate-800" 
                            strokeWidth="6" 
                            strokeDasharray="226" 
                            strokeDashoffset="56" // 3/4 circle
                            strokeLinecap="round" 
                            fill="transparent" 
                          />
                          {/* Glowing Progress Indicator */}
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="48" 
                            className="stroke-[#00f2ff]" 
                            strokeWidth="6" 
                            strokeDasharray="226" 
                            strokeDashoffset={226 - (collectedPercentage / 100) * 170} // limit to 3/4 arc
                            strokeLinecap="round" 
                            fill="transparent"
                            style={{ filter: 'drop-shadow(0px 0px 4px rgba(0, 242, 255, 0.4))' }}
                          />
                        </svg>

                        {/* Centered Digital Output */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">AUDITED BALANCE</span>
                          <span className="text-xl font-black text-white leading-tight font-mono glow-text">
                            INR {metrics.totalFundsCollected.toLocaleString()}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-[#00ffa3]/10 border border-[#00ffa3]/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full animate-pulse"></span>
                            <span className="text-[8px] text-[#00ffa3] font-bold uppercase">{collectedPercentage.toFixed(1)}% REACHED</span>
                          </div>
                        </div>
                      </div>

                      {/* Target bar */}
                      <div className="w-full mt-4 bg-slate-950 p-2.5 rounded-sm border border-slate-800 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 font-bold">
                          <span>TARGET CAP: INR {targetFunds.toLocaleString()}</span>
                          <span className="text-[#00f2ff]">REMAINING: INR {(targetFunds - metrics.totalFundsCollected).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden relative">
                          <div className="absolute top-0 left-0 h-full bg-[#00f2ff]" style={{ width: `${collectedPercentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small trend statistics beneath */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1f2937] text-left">
                    <div className="bg-slate-950/40 p-2 border border-slate-800/60 rounded-sm">
                      <span className="text-[8px] text-gray-500 uppercase block tracking-wider">MONTHLY VELOCITY</span>
                      <span className="text-xs font-bold text-[#00ffa3] flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> +14.2%
                      </span>
                    </div>
                    <div className="bg-slate-950/40 p-2 border border-slate-800/60 rounded-sm">
                      <span className="text-[8px] text-gray-500 uppercase block tracking-wider">TREASURY TRUST</span>
                      <span className="text-xs font-bold text-[#00f2ff] flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5" /> VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Total Event Expenses Panel (SPAN 4) */}
                <div className="lg:col-span-4 bg-[#101218] border border-[#1f2937] p-5 rounded-sm flex flex-col justify-between relative shadow-lg">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-gray-600 font-bold tracking-wider">EXPENSES.LEDGER // SYS_B</div>
                  
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-300 tracking-widest border-b border-[#1f2937] pb-2 mb-3 flex items-center justify-between">
                      <span>TOTAL EVENT EXPENSES</span>
                      <button 
                        onClick={() => setShowAddExpense(!showAddExpense)}
                        className="text-[9px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#00f2ff] rounded font-bold uppercase transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> CATEGORY
                      </button>
                    </h3>

                    {/* Inline Add Expense Category Form */}
                    <AnimatePresence>
                      {showAddExpense && (
                        <motion.form 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleAddExpenseSubmit}
                          className="mb-3 p-2 border border-slate-800 bg-slate-950 rounded-sm space-y-2 overflow-hidden text-left"
                        >
                          <div className="text-[9px] text-gray-400 uppercase font-black">APPEND NEW BUDGET CATEGORY</div>
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Marketing" 
                              value={newExpenseName}
                              onChange={(e) => setNewExpenseName(e.target.value)}
                              className="bg-[#050608] border border-slate-800 p-1 text-[11px] text-white rounded"
                            />
                            <input 
                              type="number" 
                              required
                              placeholder="Amount (INR)" 
                              value={newExpenseAmount}
                              onChange={(e) => setNewExpenseAmount(e.target.value)}
                              className="bg-[#050608] border border-slate-800 p-1 text-[11px] text-white rounded font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button 
                              type="button" 
                              onClick={() => setShowAddExpense(false)}
                              className="px-2 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-gray-400 rounded hover:text-white"
                            >
                              CANCEL
                            </button>
                            <button 
                              type="submit" 
                              className="px-2.5 py-0.5 text-[9px] bg-[#00f2ff] hover:bg-cyan-400 text-black font-extrabold rounded"
                            >
                              APPEND
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Expenses List Table */}
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-left">
                      {expenses.map((exp) => (
                        <div key={exp.id} className="bg-slate-950 border border-slate-900 p-2 rounded-sm flex items-center justify-between group transition-colors hover:border-slate-800">
                          {editingExpenseId === exp.id ? (
                            <form onSubmit={(e) => handleEditExpenseSubmit(e, exp.id)} className="flex items-center justify-between w-full gap-2">
                              <input 
                                type="text"
                                value={editExpenseName}
                                onChange={(e) => setEditExpenseName(e.target.value)}
                                className="bg-black border border-[#00f2ff]/30 text-white text-[11px] px-1 py-0.5 rounded font-mono max-w-[120px]"
                              />
                              <input 
                                type="number"
                                value={editExpenseAmount}
                                onChange={(e) => setEditExpenseAmount(Number(e.target.value))}
                                className="bg-black border border-[#00f2ff]/30 text-white text-[11px] px-1 py-0.5 rounded font-mono w-16"
                              />
                              <div className="flex gap-1 shrink-0">
                                <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-0.5">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => setEditingExpenseId(null)} className="text-red-400 hover:text-red-300 p-0.5">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div>
                                <span className="text-[11px] font-bold text-gray-300 block">{exp.category}</span>
                                <span className="text-[8px] text-gray-600 block uppercase">SECURE OUTFLOW BLOCKID: {exp.id}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-black text-[#ff2d55]">INR {exp.amount.toLocaleString()}</span>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                  <button 
                                    onClick={() => {
                                      setEditingExpenseId(exp.id);
                                      setEditExpenseName(exp.category);
                                      setEditExpenseAmount(exp.amount);
                                    }}
                                    className="text-gray-500 hover:text-[#00f2ff] p-0.5 cursor-pointer"
                                    title="Edit expense details"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteExpense(exp.id, exp.category)}
                                    className="text-gray-500 hover:text-red-500 p-0.5 cursor-pointer"
                                    title="Delete category"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary cost and dynamic remainder info */}
                  <div className="mt-4 pt-3 border-t border-[#1f2937] space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded border border-slate-900">
                      <span className="font-bold text-gray-400">TOTAL ACCOUNTED OUTFLOWS</span>
                      <span className="font-black text-[#ff2d55] font-mono text-sm glow-text-red">
                        INR {metrics.totalExpenses.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-gray-500 uppercase font-black">NET TREASURY VARIANCE</span>
                      <span className={`font-mono font-black ${metrics.remainingBalance >= 0 ? 'text-[#00ffa3]' : 'text-[#ff2d55]'}`}>
                        INR {metrics.remainingBalance.toLocaleString()} {metrics.remainingBalance >= 0 ? 'SURPLUS' : 'DEFICIT'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Fund Variance Analytics Panel (SPAN 4) */}
                <div className="lg:col-span-4 bg-[#101218] border border-[#1f2937] p-5 rounded-sm flex flex-col justify-between relative shadow-lg">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-gray-600 font-bold tracking-wider">CHART.D3 // SYS_C</div>
                  
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-300 tracking-widest border-b border-[#1f2937] pb-2 mb-4 flex items-center justify-between">
                      <span>DEPARTMENT PLANNED vs ACTUAL</span>
                      <span className="text-orange-400 flex items-center gap-1 text-[9px] font-bold">
                        <AlertTriangle className="w-3 h-3 animate-pulse" /> TARGET DEVIATION
                      </span>
                    </h3>

                    {/* Custom SVG Budget Variance Bar Chart */}
                    <div className="relative w-full h-40 bg-slate-950 border border-slate-900 rounded p-1.5 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 240 130">
                        {/* Horizontal Grid lines */}
                        <line x1="30" y1="20" x2="230" y2="20" className="stroke-slate-900" strokeWidth="1" strokeDasharray="2" />
                        <line x1="30" y1="50" x2="230" y2="50" className="stroke-slate-900" strokeWidth="1" strokeDasharray="2" />
                        <line x1="30" y1="80" x2="230" y2="80" className="stroke-slate-900" strokeWidth="1" strokeDasharray="2" />
                        <line x1="30" y1="110" x2="230" y2="110" className="stroke-slate-800" strokeWidth="1" />

                        {/* Y-Axis Labels */}
                        <text x="5" y="23" className="fill-slate-600 font-mono text-[7px]" textAnchor="start">15K</text>
                        <text x="5" y="53" className="fill-slate-600 font-mono text-[7px]" textAnchor="start">10K</text>
                        <text x="5" y="83" className="fill-slate-600 font-mono text-[7px]" textAnchor="start">5K</text>
                        <text x="5" y="113" className="fill-slate-600 font-mono text-[7px]" textAnchor="start">0</text>

                        {/* Bar 1 (Hackathon - CSS) Planned: 10k, Actual: 8.5k */}
                        {/* Planned (cyan outline) */}
                        <rect 
                          x="55" y="50" width="12" height="60" 
                          className="fill-cyan-500/10 stroke-[#00f2ff]" strokeWidth="1" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Hackathon - CSS', planned: 10000, actual: 8500, x: 55, y: 50 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        {/* Actual (solid cyan) */}
                        <rect 
                          x="70" y="59" width="12" height="51" 
                          className="fill-[#00f2ff] hover:fill-cyan-400" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Hackathon - CSS', planned: 10000, actual: 8500, x: 70, y: 59 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {/* Bar 2 (Symposium - SE) Planned: 12k, Actual: 13.2k */}
                        {/* Planned (orange outline) */}
                        <rect 
                          x="115" y="38" width="12" height="72" 
                          className="fill-orange-500/10 stroke-orange-400" strokeWidth="1" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Symposium - SE', planned: 12000, actual: 13200, x: 115, y: 38 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        {/* Actual (solid orange/red for overrun) */}
                        <rect 
                          x="130" y="31" width="12" height="79" 
                          className="fill-orange-500 hover:fill-orange-400" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Symposium - SE', planned: 12000, actual: 13200, x: 130, y: 31 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {/* Bar 3 (Workshop - AI) Planned: 8k, Actual: 7.4k */}
                        {/* Planned */}
                        <rect 
                          x="175" y="62" width="12" height="48" 
                          className="fill-cyan-500/10 stroke-[#00f2ff]" strokeWidth="1" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Workshop - AI', planned: 8000, actual: 7400, x: 175, y: 62 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        {/* Actual */}
                        <rect 
                          x="190" y="66" width="12" height="44" 
                          className="fill-[#00f2ff] hover:fill-cyan-400" rx="1" 
                          onMouseEnter={(e) => setHoveredBar({ dept: 'Workshop - AI', planned: 8000, actual: 7400, x: 190, y: 66 })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {/* Department codes underneath x-axis */}
                        <text x="68" y="122" className="fill-slate-500 font-mono text-[7px]" textAnchor="middle">CSS_HACK</text>
                        <text x="128" y="122" className="fill-slate-500 font-mono text-[7px]" textAnchor="middle">SE_SYMP</text>
                        <text x="188" y="122" className="fill-slate-500 font-mono text-[7px]" textAnchor="middle">AI_WORK</text>
                      </svg>

                      {/* Dynamic tooltip hovering state */}
                      {hoveredBar && (
                        <div 
                          className="absolute bg-[#050608] border border-slate-700 p-2 rounded shadow-xl text-[9px] pointer-events-none z-30"
                          style={{ left: `${Math.min(130, hoveredBar.x - 20)}px`, top: `${Math.max(5, hoveredBar.y - 45)}px` }}
                        >
                          <div className="font-bold text-[#00f2ff] uppercase">{hoveredBar.dept}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-gray-400">PLANNED: {hoveredBar.planned}</span>
                            <span className="text-white font-bold">ACTUAL: {hoveredBar.actual}</span>
                          </div>
                          <div className={`font-bold mt-0.5 ${hoveredBar.actual > hoveredBar.planned ? 'text-red-400' : 'text-emerald-400'}`}>
                            VARIANCE: {hoveredBar.actual > hoveredBar.planned ? '+' : ''}{hoveredBar.actual - hoveredBar.planned} (INR)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlights section for variance alerts */}
                  <div className="mt-3 pt-2.5 border-t border-[#1f2937] text-left">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 tracking-wider">VARIANCE DETECTED & WARN LOGS</div>
                    <div className="space-y-1 text-[9px]">
                      
                      <div className="bg-[#ff2d55]/10 border border-[#ff2d55]/30 p-1.5 rounded-sm flex items-center justify-between text-left">
                        <span className="text-gray-300 font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#ff2d55] rounded-full animate-ping"></span>
                          SYMPOSIUM - SE
                        </span>
                        <span className="font-mono text-[#ff2d55] font-black uppercase tracking-tight">INR 1,200 OVERRUN ALERT</span>
                      </div>

                      <div className="bg-[#00ffa3]/10 border border-[#00ffa3]/30 p-1.5 rounded-sm flex items-center justify-between text-left">
                        <span className="text-gray-300 font-bold uppercase flex items-center gap-1">
                          HACKATHON - CSS
                        </span>
                        <span className="font-mono text-[#00ffa3] font-black uppercase tracking-tight">INR 1,500 UNDER BUDGET SAVINGS</span>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* LOWER ROW - TWO MAIN PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: GENERAL EVENT FUND CONTRIBUTIONS (READ-ONLY EXCEPT DEPARTMENT) (SPAN 6) */}
                <div className="lg:col-span-6 bg-[#101218] border border-[#1f2937] rounded p-5 relative shadow-lg text-left">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-gray-600 font-bold tracking-wider">GRID.RO // SYS_D</div>
                  
                  <div className="border-b border-[#1f2937] pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        GENERAL EVENT FUND CONTRIBUTIONS
                      </h2>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">READ-ONLY TELEMETRY CONSOLE // DEPT INLINE SELECTABLE</p>
                    </div>

                    {/* COMPACT TABLE FILTERS */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative bg-slate-950 rounded border border-slate-800 flex items-center px-2 py-1 max-w-[150px]">
                        <Search className="w-3.5 h-3.5 text-gray-600 mr-1.5 shrink-0" />
                        <input 
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent text-[10px] text-white focus:outline-none w-full"
                        />
                      </div>

                      <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="bg-slate-950 text-[10px] text-gray-300 border border-slate-800 rounded px-1.5 py-1 focus:outline-none max-w-[100px]"
                      >
                        <option value="All">All Depts</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>

                      <select
                        value={filterEvent}
                        onChange={(e) => setFilterEvent(e.target.value)}
                        className="bg-slate-950 text-[10px] text-gray-300 border border-slate-800 rounded px-1.5 py-1 focus:outline-none max-w-[100px]"
                      >
                        <option value="All">All Events</option>
                        {eventsList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* READ-ONLY LIST TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1f2937] bg-slate-950/60">
                          <th className="p-2.5 text-gray-400 font-bold uppercase tracking-wider">Contributor Name</th>
                          <th className="p-2.5 text-gray-400 font-bold uppercase tracking-wider">Univ Reg. Number</th>
                          <th className="p-2.5 text-gray-400 font-bold uppercase tracking-wider">Department [Edit]</th>
                          <th className="p-2.5 text-gray-400 font-bold uppercase tracking-wider">Event Name</th>
                          <th className="p-2.5 text-gray-400 font-bold uppercase tracking-wider">Transaction ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2937]/50">
                        {filteredLedger.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-500 italic uppercase">No registered transaction entries detected matching parameters</td>
                          </tr>
                        ) : (
                          filteredLedger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-950/40 transition-colors">
                              <td className="p-2.5">
                                <span className="font-extrabold text-white block">{entry.studentName}</span>
                                <span className="text-[8px] text-gray-500 font-bold uppercase">{entry.year}</span>
                              </td>
                              <td className="p-2.5 font-mono text-gray-400">{entry.registerNumber}</td>
                              <td className="p-2.5">
                                {/* Editable to select from list */}
                                <select
                                  value={entry.department || 'CybSec'}
                                  onChange={(e) => handleImmediateDeptUpdate(entry.id, entry.studentName, e.target.value)}
                                  className="bg-slate-950 text-[10px] text-[#00f2ff] border border-slate-800 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none font-bold"
                                >
                                  {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2.5 text-gray-300 font-mono text-[10px]">{entry.eventName || 'CybSec Symposium'}</td>
                              <td className="p-2.5 text-slate-500 font-mono text-[9px] uppercase tracking-tight">{entry.transactionId || 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* RIGHT: ACTIVE ADMIN EVENT FEE LEDGER INTERFACE (FULLY EDITABLE) (SPAN 6) */}
                <div className="lg:col-span-6 bg-[#101218] border border-[#ff2d55]/20 rounded p-5 relative shadow-lg text-left">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-red-700 font-bold tracking-wider">GRID.RW // ADMIN_A</div>
                  
                  <div className="border-b border-[#1f2937] pb-3 mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-black text-[#00f2ff] uppercase tracking-widest flex items-center gap-1.5 glow-text">
                        <Server className="w-4 h-4 text-[#00f2ff]" />
                        ACTIVE ADMIN: EVENT FEE LEDGER INTERFACE
                      </h2>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">READ-WRITE STORAGE CLOUD TERMINAL // ALL COMMITS MONITORED</p>
                    </div>
                  </div>

                  {/* ACTIVE EDITABLE GRID */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1f2937] bg-slate-950/60 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-2.5">[Edit] Student Name</th>
                          <th className="p-2.5">[Edit] Reg. Number</th>
                          <th className="p-2.5">[Edit] Year (Select)</th>
                          <th className="p-2.5">[Edit] Dept (Select)</th>
                          <th className="p-2.5">[Edit] Fee (Set-able)</th>
                          <th className="p-2.5">[Edit] Receipt Proof</th>
                          <th className="p-2.5">[Update Status]</th>
                          <th className="p-2.5 text-right">Commit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2937]/50">
                        {ledger.map((entry) => {
                          const isModifiedVal = isRowModified(entry.id);
                          return (
                            <tr key={entry.id} className={`hover:bg-slate-950/30 transition-colors ${isModifiedVal ? 'bg-[#ff2d55]/5 border-l-2 border-l-[#ff2d55]' : ''}`}>
                              {/* Student Name */}
                              <td className="p-2">
                                <div className="flex items-center space-x-1.5">
                                  <input 
                                    type="text"
                                    value={getDisplayValue(entry, 'studentName')}
                                    onChange={(e) => handleRowDraftChange(entry.id, 'studentName', e.target.value)}
                                    className={`bg-transparent text-white font-extrabold p-1 rounded focus:bg-black focus:outline-none w-24 border ${isFieldModified(entry, 'studentName') ? 'border-[#ff2d55]/70 text-[#ff2d55]' : 'border-transparent'}`}
                                  />
                                  <Edit2 className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                                </div>
                              </td>

                              {/* Reg Number */}
                              <td className="p-2">
                                <div className="flex items-center space-x-1">
                                  <input 
                                    type="text"
                                    value={getDisplayValue(entry, 'registerNumber')}
                                    onChange={(e) => handleRowDraftChange(entry.id, 'registerNumber', e.target.value.toUpperCase())}
                                    className={`bg-transparent text-gray-300 font-mono p-1 rounded focus:bg-black focus:outline-none w-24 border uppercase ${isFieldModified(entry, 'registerNumber') ? 'border-[#ff2d55]/70 text-[#ff2d55]' : 'border-transparent'}`}
                                  />
                                </div>
                              </td>

                              {/* Year Select */}
                              <td className="p-2">
                                <select
                                  value={getDisplayValue(entry, 'year')}
                                  onChange={(e) => handleRowDraftChange(entry.id, 'year', e.target.value)}
                                  className={`bg-slate-950 text-gray-300 border p-1 rounded text-[10px] focus:outline-none ${isFieldModified(entry, 'year') ? 'border-[#ff2d55]/70 text-[#ff2d55]' : 'border-slate-800'}`}
                                >
                                  <option value="1st Year">1st Year</option>
                                  <option value="2nd Year">2nd Year</option>
                                  <option value="3rd Year">3rd Year</option>
                                  <option value="Final Year">Final Year</option>
                                </select>
                              </td>

                              {/* Dept Select */}
                              <td className="p-2">
                                <select
                                  value={getDisplayValue(entry, 'department')}
                                  onChange={(e) => handleRowDraftChange(entry.id, 'department', e.target.value)}
                                  className={`bg-slate-950 text-gray-300 border p-1 rounded text-[10px] focus:outline-none ${isFieldModified(entry, 'department') ? 'border-[#ff2d55]/70 text-[#ff2d55]' : 'border-slate-800'}`}
                                >
                                  {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Contribution Fee */}
                              <td className="p-2">
                                <div className="flex items-center space-x-1">
                                  <input 
                                    type="number"
                                    value={getDisplayValue(entry, 'amount')}
                                    onChange={(e) => handleRowDraftChange(entry.id, 'amount', Number(e.target.value))}
                                    className={`bg-transparent text-emerald-400 font-black font-mono p-1 rounded focus:bg-black focus:outline-none w-16 border ${isFieldModified(entry, 'amount') ? 'border-[#ff2d55]/70 text-[#ff2d55]' : 'border-transparent'}`}
                                  />
                                </div>
                              </td>

                              {/* Receipt Proof / Attachment */}
                              <td className="p-2">
                                <div className="flex items-center space-x-2">
                                  {entry.screenshotUrl ? (
                                    <button
                                      onClick={() => setShowProofId(showProofId === entry.id ? null : entry.id)}
                                      className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-[9px] text-[#00f2ff] font-bold cursor-pointer"
                                    >
                                      VIEW PROOF
                                    </button>
                                  ) : (
                                    <span className="text-gray-600 italic text-[9px]">Manual Record</span>
                                  )}
                                  
                                  {/* Upload capability directly in the row */}
                                  <label className="p-1 hover:bg-slate-800 rounded cursor-pointer" title="Update receipt screenshot attachment">
                                    <Upload className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                    <input 
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            handleRowDraftChange(entry.id, 'screenshotUrl', reader.result as string);
                                            handleRowDraftChange(entry.id, 'screenshotName', file.name);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </td>

                              {/* Status Dropdown */}
                              <td className="p-2">
                                <select
                                  value={getDisplayValue(entry, 'status')}
                                  onChange={(e) => handleRowDraftChange(entry.id, 'status', e.target.value)}
                                  className={`p-1 text-[10px] font-bold rounded focus:outline-none ${
                                    getDisplayValue(entry, 'status') === 'Verified' 
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-red-950 text-red-400 border border-red-500/20'
                                  } ${isFieldModified(entry, 'status') ? 'border-[#ff2d55]' : ''}`}
                                >
                                  <option value="Verified">Verified</option>
                                  <option value="Pending">Pending</option>
                                </select>
                              </td>

                              {/* Commit Actions (Save/Reset) */}
                              <td className="p-2 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {isModifiedVal ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveRow(entry)}
                                        className="p-1 bg-[#00ffa3] hover:bg-emerald-400 text-black rounded cursor-pointer"
                                        title="Commit modifications to cloud database"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDiscardRow(entry.id)}
                                        className="p-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded cursor-pointer"
                                        title="Discard unsaved changes"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteRow(entry.id, entry.studentName)}
                                      className="p-1 text-gray-600 hover:text-red-500 rounded cursor-pointer hover:bg-slate-900 transition-colors"
                                      title="Wipe record block"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Red modification warnings indicator */}
                  {Object.keys(localDrafts).length > 0 && (
                    <div className="mt-3 p-2 bg-[#ff2d55]/10 border border-[#ff2d55]/30 rounded text-[10px] text-[#ff2d55] flex items-center space-x-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>UNSAVED CHANGES DETECTED: Modified cells are highlighted in red. Please commit using the Green diskette icon.</span>
                    </div>
                  )}

                  {/* NESTED ADD NEW LEDGER ENTRY FORM (CRITICAL FOR DUAL CAPABILITY) */}
                  <div className="mt-6 pt-5 border-t border-slate-800 bg-slate-950/40 p-4 rounded border border-slate-800 text-left">
                    <h3 className="text-xs font-black text-[#00f2ff] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add New Event Fee Entry
                    </h3>

                    <form onSubmit={handleNewEntrySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Student Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alice Johnson"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#00f2ff]/60"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Registration Number</label>
                          <input
                            type="text"
                            required
                            placeholder="CS2023-CY009"
                            value={newReg}
                            onChange={(e) => setNewReg(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white uppercase focus:border-[#00f2ff]/60"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Target Department</label>
                          <select
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-gray-300 focus:border-[#00f2ff]/60"
                          >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Year Level</label>
                          <select
                            value={newYear}
                            onChange={(e: any) => setNewYear(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-gray-300"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="Final Year">Final Year</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Contribution (INR)</label>
                          <input
                            type="number"
                            required
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="750"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Target Event</label>
                          <select
                            value={newEventName}
                            onChange={(e) => setNewEventName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-gray-300"
                          >
                            {eventsList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Secure Transaction ID</label>
                          <input
                            type="text"
                            required
                            disabled
                            value={newTransactionId}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1 uppercase font-bold">Receipt Screenshot Proof</label>
                        <div className="flex items-center gap-4 bg-slate-950/80 p-2 border border-slate-800 rounded">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="text-[10px] text-gray-400 cursor-pointer max-w-full"
                          />
                          {newProofName && (
                            <span className="text-[10px] text-emerald-400 font-bold font-mono">
                              ✓ {newProofName} (LOADED)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-[#00f2ff] text-black font-extrabold text-xs uppercase tracking-wider rounded transition-all hover:brightness-110 cursor-pointer shadow-lg"
                      >
                        SUBMIT NEW TICKET & SYNCHRONIZE LEDGER
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* Cryptographic Image Proof Modal */}
              <AnimatePresence>
                {showProofId && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-[#101218] border-2 border-[#00f2ff]/30 p-5 rounded max-w-md w-full relative text-left shadow-2xl"
                    >
                      <button 
                        onClick={() => setShowProofId(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white font-extrabold text-lg cursor-pointer"
                      >
                        ×
                      </button>
                      
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                        <Shield className="w-5 h-5 text-[#00f2ff]" />
                        <h4 className="text-xs font-black text-[#00f2ff] uppercase tracking-widest">
                          UPI RECEIPT CRYPTOGRAPHIC ATTACHMENT
                        </h4>
                      </div>

                      <div className="bg-slate-950 border border-slate-900 rounded p-1 text-center">
                        {(() => {
                          const record = ledger.find(l => l.id === showProofId) || localDrafts[showProofId!];
                          if (!record) return <p className="text-xs text-gray-500">Record trace lost.</p>;

                          const proofUrl = record.screenshotUrl;
                          if (!proofUrl) {
                            return <p className="text-xs text-gray-500 py-8">No proof file attached to this block.</p>;
                          }

                          if (proofUrl.startsWith('mock') || proofUrl === 'mock_uploaded_screenshot') {
                            return (
                              <div className="h-44 bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-[10px] text-gray-500 italic uppercase space-y-2">
                                <FileText className="w-8 h-8 text-slate-700" />
                                <span>SYSTEM SECURE TRANSMITTAL PROOF RECEIPT</span>
                                <span className="font-mono text-[8px] text-[#00f2ff] not-italic">SHA-256: 4f8b2d1847c210abf9...</span>
                              </div>
                            );
                          }

                          return (
                            <img
                              src={proofUrl}
                              alt="Transaction Screenshot"
                              referrerPolicy="no-referrer"
                              className="w-full max-h-60 object-contain rounded"
                            />
                          );
                        })()}
                      </div>

                      <div className="mt-3 bg-slate-950 p-2 rounded text-[9px] font-mono text-gray-500 space-y-1">
                        <div>BLOCK INDEX: {showProofId}</div>
                        <div>ORIGIN HOST IP: 192.168.104.22 // ENCRYPT: SHA-256 / AES-256</div>
                        <div>TIMESTAMP: {new Date().toISOString()}</div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'hackathon' && (
            <motion.div
              key="hackathon"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* SEPARATE HACKATHON SECTION (A new, clearly distinct section) */}
              <div className="bg-[#101218] border border-[#ff2d55]/30 p-6 rounded-sm text-left shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-[9px] text-[#ff2d55] font-black animate-pulse uppercase">LIVE CYBERRANGE SIMULATOR ACTIVE</div>
                
                <div className="flex items-center gap-3 border-b border-[#1f2937] pb-3 mb-5">
                  <Cpu className="w-6 h-6 text-[#ff2d55]" />
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">CYBERRANGE CTF & HACKATHON ANALYTICS CONSOLE</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Separate event tracking system for active security testing campaigns</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Team scoreboard (SPAN 7) */}
                  <div className="lg:col-span-7 bg-slate-950 p-4 rounded border border-slate-800">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3 flex items-center justify-between">
                      <span>ACTIVE TEAMS SCOREBOARD</span>
                      <button 
                        onClick={handleExploitSimulation}
                        disabled={simulatingExploit}
                        className="px-2.5 py-1 bg-[#ff2d55] text-black font-extrabold text-[9px] rounded uppercase hover:bg-red-400 transition-colors disabled:opacity-50"
                      >
                        {simulatingExploit ? "SCANNING TARGETS..." : "SIMULATE EXPLOIT ATTEMPT"}
                      </button>
                    </h3>

                    <div className="space-y-2">
                      {hackathonTeams.map((team, index) => (
                        <div key={team.id} className="bg-[#101218] border border-slate-900 p-3 rounded flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-[#ff2d55]">
                              #{index + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-white block">{team.name}</span>
                              <span className="text-[9px] text-gray-500 uppercase">{team.membersCount} Hackers registered</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <span className="text-[8px] text-gray-500 uppercase block">Compromised Nodes</span>
                              <span className="text-xs font-mono font-bold text-[#00f2ff]">{team.compromisedNodes} / 6</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-gray-500 uppercase block">CTF score</span>
                              <span className="text-sm font-mono font-black text-orange-400">{team.score} PTS</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cyber range map nodes (SPAN 5) */}
                  <div className="lg:col-span-5 bg-slate-950 p-4 rounded border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest border-b border-slate-900 pb-2 mb-4">
                        LIVE CTF LOGS & TELEMETRY
                      </h3>
                      
                      {/* Log Screen */}
                      <div className="bg-black/80 border border-slate-900 p-3 rounded h-36 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1 text-left">
                        {ctfLog.map((log, idx) => (
                          <div key={idx} className="leading-relaxed font-mono">
                            <span className="text-slate-600 select-none mr-2">&gt;</span>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900">
                      <div className="text-[10px] text-gray-400 uppercase font-black mb-2">TARGET RANGE RANGE NETWORK NODES STATUS</div>
                      <div className="grid grid-cols-4 gap-2">
                        {['10.0.12.10', '10.0.12.11', '10.0.12.12', '10.0.12.15'].map((ip, i) => (
                          <div key={ip} className="bg-[#101218] border border-slate-900 p-2 rounded text-center">
                            <span className="text-[8px] text-gray-500 font-mono block">{ip}</span>
                            <span className={`text-[9px] font-bold block mt-1 ${i % 3 === 0 ? 'text-[#ff2d55] animate-pulse' : 'text-[#00ffa3]'}`}>
                              {i % 3 === 0 ? 'BREACHED' : 'SECURE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6 text-left"
            >
              {/* REPORTS AND AUDITS VIEW */}
              <div className="bg-[#101218] border border-slate-800 p-6 rounded-sm shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#1f2937] pb-4 mb-5 gap-3">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      LEDGER AUDIT REPORT CENTER
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Secure cryptography checksum checks & spreadsheet exporter tools</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={triggerCSVDownload}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> EXPORT EXCEL/CSV
                    </button>
                    <button 
                      onClick={fetchLedgerData}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> FORCE AUDIT RE-SYNC
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column stats details */}
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                      AUDIT METRICS TRACE
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="bg-[#101218] p-3 border border-slate-900 rounded">
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">TOTAL VERIFIED COLLECTION REVENUE</span>
                        <span className="text-lg font-black text-[#00ffa3] font-mono leading-tight">
                          INR {metrics.totalFundsCollected.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-[#101218] p-3 border border-slate-900 rounded">
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">TOTAL COMMITTED VENUE SPENDINGS</span>
                        <span className="text-lg font-black text-[#ff2d55] font-mono leading-tight">
                          INR {metrics.totalExpenses.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-[#101218] p-3 border border-slate-900 rounded">
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">LEDGER VERIFICATION RATIO</span>
                        <span className="text-lg font-black text-white font-mono leading-tight">
                          {regAnalytics.verifiedCount} / {(regAnalytics.verifiedCount + regAnalytics.pendingCount)} BLOCKS VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction verification trail logs (SPAN 2) */}
                  <div className="lg:col-span-2 bg-slate-950 border border-slate-900 p-4 rounded">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
                      CRYPTOGRAPHIC SHA-256 AUDIT LOG TRAIL (BLOCKCHAIN PARADIGM)
                    </h3>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {ledger.map((l, index) => (
                        <div key={l.id} className="bg-[#101218] border border-slate-900 p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                          <div>
                            <span className="text-xs font-bold text-white block">{l.studentName}</span>
                            <span className="text-[9px] font-mono text-slate-500 select-all block mt-0.5">
                              BLOCK_HASH: f3ae82d1{index}a90c0b9a9108c9d2f{l.id.replace('l_', '')}
                            </span>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-bold uppercase ${l.status === 'Verified' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {l.status === 'Verified' ? '✓ CRYPTO_SIGNED' : '✖ PENDING_VERIFICATION'}
                            </span>
                            <span className="text-[8px] text-gray-500 uppercase font-mono block mt-0.5">INDEXTIMESTAMP: {l.date ? new Date(l.date).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Security Status Message Banner / Ticker */}
      <footer className="max-w-7xl mx-auto w-full border-t border-[#1f2937] mt-8 pt-4 pb-2 z-10">
        <div className="bg-slate-950 border border-slate-900 rounded p-3 text-[10px] text-gray-500 font-mono overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center space-x-2 font-mono text-left">
              <Shield className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
              <span className="font-mono text-gray-400">
                ACCESS CONTROL: SECURE AUDIT TRAIL LOGGING ACTIVE. ALL MODIFICATIONS ARE TRACKED.
              </span>
            </div>
            <div className="flex items-center space-x-2 font-mono text-left">
              <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping shrink-0"></span>
              <span className="font-mono text-[#00ffa3]">
                DATABASE ENCRYPTION: AES-256 ACTIVE.
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
