/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Shield, Briefcase, Calendar, GraduationCap, 
  CircleDollarSign, Plus, AlertCircle, LogOut, Terminal, Sparkles,
  Pencil, Trash2, UploadCloud, FileAudio, FileVideo, Image as ImageIcon,
  Folder, Check, Info, Music, Film, Layers, Eye, ChevronRight, Loader2, Globe, Search
} from 'lucide-react';
import { Threat, JobListing, User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

// Custom Programmatic Vector Department Logo: Blue Shield + Circuit Board + Keyhole
const CyberDepartmentLogo = () => (
  <div className="relative flex-shrink-0">
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-blue-600 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Blue Shield Base */}
      <path d="M50 10 L85 25 V55 C85 75 50 90 50 90 C50 90 15 75 15 55 V25 L50 10 Z" fill="#eff6ff" stroke="#2563eb" strokeWidth="3" />
      {/* Circuit board tracers */}
      <path d="M30 35 H45 M70 35 H55 M30 50 H45 M70 50 H55" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="30" cy="35" r="2" fill="#2563eb" />
      <circle cx="70" cy="35" r="2" fill="#2563eb" />
      <circle cx="30" cy="50" r="2" fill="#3b82f6" />
      <circle cx="70" cy="50" r="2" fill="#3b82f6" />
      {/* Central Keyhole integrated */}
      <circle cx="50" cy="42" r="7" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1.5" />
      <path d="M46 47 L42 65 H58 L54 47 Z" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1.5" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-white">
      <Check className="w-2.5 h-2.5 stroke-[4px]" />
    </div>
  </div>
);

// Programmatic World Map with Light-Blue Animated Attack Lines
const WorldMapSVG = () => (
  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 h-48 flex items-center justify-center">
    <svg viewBox="0 0 400 200" className="w-full h-full text-slate-200 fill-slate-200/60" stroke="#e2e8f0" strokeWidth="1">
      {/* Outlined minimal continents */}
      {/* North America */}
      <path d="M30 30 L80 20 L110 40 L120 70 L90 80 L60 80 L50 90 L40 60 Z" />
      {/* South America */}
      <path d="M80 90 L110 95 L120 120 L100 170 L75 130 Z" />
      {/* Eurasia & Africa */}
      <path d="M150 25 L230 15 L320 25 L340 55 L290 75 L240 95 L200 85 L180 80 L150 45 Z" />
      <path d="M160 85 L200 85 L215 110 L200 160 L180 140 L160 110 Z" />
      {/* Australia */}
      <path d="M290 125 L330 125 L340 145 L300 155 Z" />

      {/* Light-blue Attack Curves */}
      <g stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,4" fill="none">
        <path d="M70 50 Q 150 30, 200 50" className="animate-pulse" />
        <path d="M180 110 Q 250 115, 310 135" />
        <path d="M95 110 Q 180 60, 220 40" />
      </g>

      {/* Real-time sweeping radar circle */}
      <circle cx="200" cy="100" r="80" stroke="rgba(37,99,235,0.06)" strokeWidth="1.5" fill="none" className="animate-ping" />

      {/* Pulsing Active Threat Nodes */}
      <g fill="#2563eb">
        <circle cx="70" cy="50" r="4.5" className="animate-ping text-blue-600 opacity-75" />
        <circle cx="70" cy="50" r="3" />
        
        <circle cx="200" cy="50" r="4.5" className="animate-ping text-blue-600 opacity-75" />
        <circle cx="200" cy="50" r="3" />

        <circle cx="310" cy="135" r="4.5" className="animate-ping text-blue-600 opacity-75" />
        <circle cx="310" cy="135" r="3" />
      </g>
    </svg>
    <div className="absolute bottom-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-sm text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
      <Globe className="w-3 h-3 text-blue-500 animate-spin" />
      <span>SATELLITE TELEMETRY</span>
    </div>
  </div>
);

export default function Dashboard({ user, onLogout, onNavigate }: DashboardProps) {
  // Navigation Tabs: 'home' | 'gallery' | 'careers' | 'threats'
  const [activeTab, setActiveTab] = useState<'home' | 'gallery' | 'careers' | 'threats'>('home');

  // Threat & Career states
  const [threats, setThreats] = useState<Threat[]>([]);
  const [careers, setCareers] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New threat submission (for staff)
  const [showAddThreat, setShowAddThreat] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'good' | 'bad'>('bad');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [newAction, setNewAction] = useState('');
  const [submitError, setSubmitError] = useState('');

  // HOME Configuration states
  const [association, setAssociation] = useState<any>(null);
  const [editAssocName, setEditAssocName] = useState('Smart Entry to Cyber Web Portal');
  const [editDeptName, setEditDeptName] = useState('Computer Science Engineering (Cybersecurity)');
  const [editAcademicYear, setEditAcademicYear] = useState('2026-2027');
  const [editObjective, setEditObjective] = useState('To foster academic excellence, advanced threat research, and cybersecurity operational readiness across the student chapters.');
  const [homeMessage, setHomeMessage] = useState('');
  const [homeError, setHomeError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // GALLERY states
  const [gallery, setGallery] = useState<any[]>([]);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'audio'>('image');
  const [uploadBase64, setUploadBase64] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Active audio player track helper
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Career applying overlay state
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyingProgress, setApplyingProgress] = useState<number>(0);
  const [applyingStep, setApplyingStep] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll threats & careers
  const fetchThreatsAndCareers = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/threats'),
        fetch('/api/careers')
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      setThreats(tData);
      setCareers(cData);
    } catch (err) {
      console.error('Error polling analytics telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch association data
  const fetchAssociation = async () => {
    try {
      const res = await fetch('/api/association');
      if (res.ok) {
        const data = await res.json();
        setAssociation(data);
        if (data.name) setEditAssocName(data.name);
        if (data.departmentName) setEditDeptName(data.departmentName);
        if (data.academicYear) setEditAcademicYear(data.academicYear);
        if (data.objective) setEditObjective(data.objective);
      }
    } catch (err) {
      console.error('Error fetching association profile:', err);
    }
  };

  // Fetch gallery media files
  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (err) {
      console.error('Error loading gallery media archives:', err);
    }
  };

  useEffect(() => {
    fetchThreatsAndCareers();
    fetchAssociation();
    fetchGallery();

    const interval = setInterval(fetchThreatsAndCareers, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update HOME Layout configuration
  const handleUpdateHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setHomeMessage('');
    setHomeError('');
    setIsSyncing(true);

    try {
      const res = await fetch('/api/association/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editAssocName,
          departmentName: editDeptName,
          academicYear: editAcademicYear,
          objective: editObjective
        })
      });

      if (!res.ok) throw new Error('Could not synchronize configuration details.');
      const data = await res.json();
      setAssociation(data);
      setHomeMessage('Home settings successfully synchronized!');
      setTimeout(() => setHomeMessage(''), 4000);
    } catch (err: any) {
      setHomeError(err.message || 'Synchronization failure.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Threat Submissions
  const handleAddThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!newTitle || !newDescription) {
      setSubmitError('Validation Alert: Title and Threat Description are mandatory.');
      return;
    }

    try {
      const response = await fetch('/api/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          severity: newSeverity,
          description: newDescription,
          actionOrPatch: newAction
        })
      });

      if (!response.ok) {
        throw new Error('API server rejected the security packet.');
      }

      const freshThreat = await response.json();
      if (freshThreat) {
        setThreats(prev => [freshThreat, ...prev]);
      }
      
      // Reset
      setNewTitle('');
      setNewDescription('');
      setNewAction('');
      setShowAddThreat(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Transmission error.');
    }
  };

  // File Upload Handlers (Drag & Drop + Click Selection)
  const handleFileProcess = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const mimeType = file.type;
    let inferredType: 'image' | 'video' | 'audio' = 'image';
    if (mimeType.startsWith('video/')) inferredType = 'video';
    if (mimeType.startsWith('audio/')) inferredType = 'audio';

    setUploadFileName(file.name);
    setUploadFileSize(sizeInMB);
    setUploadType(inferredType);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadMessage('');
    setIsUploading(true);

    if (!uploadBase64) {
      setUploadError('Drag & drop or select a media asset prior to deploying.');
      setIsUploading(false);
      return;
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadBase64,
          caption: uploadCaption || uploadFileName || 'Department Media Asset Archive',
          type: uploadType,
          fileSize: uploadFileSize || '2.4 MB',
          fileType: uploadType === 'image' ? 'image/png' : uploadType === 'video' ? 'video/mp4' : 'audio/mp3'
        })
      });

      if (!res.ok) throw new Error('Repository rejected the media payload.');

      setUploadCaption('');
      setUploadBase64('');
      setUploadFileName('');
      setUploadFileSize('');
      setUploadMessage('Multimedia asset deployed to database successfully!');
      fetchGallery();
      setTimeout(() => setUploadMessage(''), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'Archive failure.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Scrub this multimedia asset from department archives?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error('Server returned an error.');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Could not delete media. Please try again.');
    }
  };

  // Secure Apply Simulation Flow to indicate dynamic back-end connection
  const handleSecureApply = (jobId: string, role: string, company: string) => {
    setApplyingJobId(jobId);
    setApplyingProgress(0);
    setApplyingStep('Handshaking with backend application gateway...');
    
    const steps = [
      'Establishing secure handshake protocol to placement server...',
      'Validating user cryptographic tokens and identity credentials...',
      'Mapping student parameters against placement pre-requisites...',
      'Compiling background safety metrics payload...',
      'Synchronizing records with department Spanner databases...',
      'Secure handshake completed successfully!'
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setApplyingProgress(Math.floor((currentStepIdx / steps.length) * 100));
        setApplyingStep(steps[currentStepIdx]);
      } else {
        setApplyingProgress(100);
        setApplyingStep('Session established. Routing to interactive application form...');
        clearInterval(interval);
        setTimeout(() => {
          setApplyingJobId(null);
          alert(`Successfully authenticated! Handshake accomplished for: ${role} @ ${company}. Let's construct secure paths.`);
        }, 1200);
      }
    }, 600);
  };

  // Filter gallery list
  const filteredGallery = gallery.filter((item) => {
    if (galleryFilter === 'all') return true;
    return item.type === galleryFilter;
  });

  const goodThreats = threats.filter(t => t.type === 'good');
  const badThreats = threats.filter(t => t.type === 'bad');

  // Hardcoded classic role cards if database has empty careers
  const fallbackCareers: JobListing[] = [
    {
      id: 'fall-1',
      role: 'Penetration Tester',
      company: 'Securitas Cyber Labs',
      vacancy: 3,
      salary: '$115,000 - $135,000',
      requirements: 'Metasploit, BurpSuite Pro, Web Application Fuzzing, Scripting (Python/Bash).',
      location: 'Bangalore, IN'
    },
    {
      id: 'fall-2',
      role: 'SOC Analyst (Tier-2)',
      company: 'Defensive Shield Corp',
      vacancy: 5,
      salary: '$95,000 - $110,000',
      requirements: 'SIEM Triage (Splunk), Wireshark Analysis, YARA Rule Writing, Incident Response.',
      location: 'Hyderabad, IN'
    },
    {
      id: 'fall-3',
      role: 'Information Security Auditor',
      company: 'Apex Integrity Assurance',
      vacancy: 2,
      salary: '$105,000 - $120,000',
      requirements: 'ISO 27001 compliance, GDPR protocols, risk assessments, governance frameworks.',
      location: 'Chennai, IN'
    }
  ];

  const displayCareers = careers.length > 0 ? careers : fallbackCareers;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200 bg-white px-4 md:px-8 py-4 relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3.5">
            <CyberDepartmentLogo />
            <div className="text-left">
              <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {association?.name || 'Smart Entry to Cyber Web Portal'}
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                {association?.departmentName || 'Computer Science Engineering (Cybersecurity)'} 
                <span className="mx-2 text-slate-300">|</span> 
                User: <span className="text-blue-600 font-semibold font-mono">{user.username} ({user.role})</span>
              </p>
            </div>
          </div>

          {/* Actions & Session Control */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SECURE ENDPOINT ACTIVE
              </span>
            </div>
            <button
              id="logout-button"
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 text-xs font-bold tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOP NAVIGATION TABS */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex space-x-2 overflow-x-auto py-2">
            <button
              id="tab-home-trigger"
              onClick={() => setActiveTab('home')}
              className={`px-5 py-2.5 rounded-lg font-bold tracking-wide text-xs uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>[Home]</span>
            </button>

            <button
              id="tab-gallery-trigger"
              onClick={() => setActiveTab('gallery')}
              className={`px-5 py-2.5 rounded-lg font-bold tracking-wide text-xs uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>[Gallery]</span>
            </button>

            <button
              id="tab-careers-trigger"
              onClick={() => {
                setActiveTab('careers');
                setTimeout(() => {
                  document.getElementById('career-placement-gateway')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`px-5 py-2.5 rounded-lg font-bold tracking-wide text-xs uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'careers'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>[Cyber Career Hub]</span>
            </button>

            <button
              id="tab-threats-trigger"
              onClick={() => {
                setActiveTab('threats');
                setTimeout(() => {
                  document.getElementById('threat-intelligence-feed')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`px-5 py-2.5 rounded-lg font-bold tracking-wide text-xs uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'threats'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>[Threat Monitor]</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 relative">
        <AnimatePresence mode="wait">
          
          {/* HOME TAB OR CAREREERS/THREATS SUB-TRIGGERS */}
          {(activeTab === 'home' || activeTab === 'careers' || activeTab === 'threats') && (
            <motion.div
              key="home-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 text-left"
            >
              
              {/* Google Search Tool Section */}
              {activeTab === 'home' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left mb-6">
                  <div className="absolute top-0 left-0 w-24 h-1 bg-blue-600"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">Unified Research & Web Search</h2>
                        <p className="text-[11px] text-slate-500">Search academic records, global threat databases, CVE definitions, and the open web</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono font-bold uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 self-start md:self-auto">
                      GOOGLE INDEX ENGINE ACTIVE
                    </div>
                  </div>

                  <form 
                    action="https://www.google.com/search" 
                    method="get" 
                    target="_blank" 
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="q"
                        placeholder="Type anything to search (e.g., CVE-2026 vulnerability, cryptography, cyber syllabus...)"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/30 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-sans"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2 border-none"
                    >
                      <Search className="w-4 h-4" />
                      <span>SEARCH ENGINE</span>
                    </button>
                  </form>

                  {/* Search suggestions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Suggested Targets:</span>
                    {[
                      'CVE-2026 Vulnerabilities', 
                      'OWASP Top 10 API Security', 
                      'Post-Quantum Cryptography', 
                      'Cyber Security Department Syllabus',
                      'Ransomware mitigation standards'
                    ].map((tag) => (
                      <a
                        key={tag}
                        href={`https://www.google.com/search?q=${encodeURIComponent(tag)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100/50 transition-all font-medium"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Only show Quick Links on Home and standard listings */}
              {activeTab === 'home' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    id="nav-academics"
                    onClick={() => onNavigate('academics')}
                    className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-12 h-1.5 bg-blue-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">REGULATION T_M</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase group-hover:text-blue-600 transition-colors">Academic Records</h3>
                      <p className="text-xs text-slate-500 mt-1">Timetables, regulation sheets, and batch directory indexes.</p>
                    </div>
                  </button>

                  <button
                    id="nav-quiz"
                    onClick={() => onNavigate('quizzes')}
                    className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-12 h-1.5 bg-teal-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">SEC_EXAMS</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase group-hover:text-teal-600 transition-colors">Assessment & Quiz</h3>
                      <p className="text-xs text-slate-500 mt-1">Take cyber assessment quizzes and log internal test scores.</p>
                    </div>
                  </button>

                  <button
                    id="nav-association"
                    onClick={() => onNavigate('association')}
                    className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-12 h-1.5 bg-orange-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">EVENTS ARCH</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase group-hover:text-orange-600 transition-colors">Association & Events</h3>
                      <p className="text-xs text-slate-500 mt-1">Notice boards, expert guest lectures, seminars, and slides.</p>
                    </div>
                  </button>

                  <button
                    id="nav-funds"
                    onClick={() => onNavigate('funds')}
                    className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-12 h-1.5 bg-indigo-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <CircleDollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">LEDGER SEC</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase group-hover:text-indigo-600 transition-colors">Event Fund Ledger</h3>
                      <p className="text-xs text-slate-500 mt-1">Track participant receipts, verified bills, and transparent ledgers.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* TWO COLUMN MIDDLE SECTION: Home Config & Live Threat Intelligence Feed */}
              {(activeTab === 'home' || activeTab === 'threats') && (
                <div id="threat-intelligence-feed" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* HOME FOLDER CONFIGURATION PANEL (Center-Left) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative text-left">
                    <div className="absolute top-0 left-0 w-16 h-1 bg-blue-600"></div>
                    
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-5">
                      <Pencil className="w-5 h-5 text-blue-600" />
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">Home Folder Configuration</h2>
                        <p className="text-[11px] text-slate-500">Live administrative layout context custom settings</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateHome} className="space-y-4">
                      <div>
                        <label className="block text-[11px] text-slate-600 font-bold mb-1.5 uppercase tracking-wider">
                          Association Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editAssocName}
                          onChange={(e) => setEditAssocName(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 font-bold mb-1.5 uppercase tracking-wider">
                          Department Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editDeptName}
                          onChange={(e) => setEditDeptName(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-600 font-bold mb-1.5 uppercase tracking-wider">
                            Academic Year
                          </label>
                          <input
                            type="text"
                            required
                            value={editAcademicYear}
                            onChange={(e) => setEditAcademicYear(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 font-bold mb-1.5 uppercase tracking-wider">
                          Department/Portal Objective
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={editObjective}
                          onChange={(e) => setEditObjective(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none transition-all resize-none font-sans"
                        />
                      </div>

                      {homeMessage && (
                        <div className="text-xs text-teal-800 bg-teal-50 border border-teal-100 p-3 rounded-lg font-semibold uppercase tracking-wider flex items-center space-x-2">
                          <Check className="w-4 h-4 text-teal-600" />
                          <span>{homeMessage}</span>
                        </div>
                      )}
                      {homeError && (
                        <div className="text-xs text-orange-800 bg-orange-50 border border-orange-100 p-3 rounded-lg font-semibold uppercase tracking-wider flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span>{homeError}</span>
                        </div>
                      )}

                      <button
                        id="update-layout-button"
                        type="submit"
                        disabled={isSyncing}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2 border-none"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>SYNCING CONTEXT...</span>
                          </>
                        ) : (
                          <span>UPDATE HOME LAYOUT</span>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* LIVE SECURITY FEED PANEL (Center-Right) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative text-left">
                    <div className="absolute top-0 right-0 w-16 h-1 bg-orange-500"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping"></div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                            Active Cyber Threat & Vulnerability Attacks
                          </h2>
                          <p className="text-[11px] text-slate-500">Live defensive monitoring panel displaying active global threat signatures</p>
                        </div>
                      </div>

                      {user.role === 'staff' && (
                        <button
                          id="add-threat-toggle"
                          onClick={() => setShowAddThreat(!showAddThreat)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{showAddThreat ? 'CLOSE INCIDENT' : 'LOG INCIDENT'}</span>
                        </button>
                      )}
                    </div>

                    {/* Staff Incident logger form */}
                    <AnimatePresence>
                      {showAddThreat && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-5"
                        >
                          <form onSubmit={handleAddThreat} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-bold">Threat Indicator</label>
                                <input
                                  type="text"
                                  required
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  placeholder="Rogue Endpoint Injection Alert"
                                  className="w-full bg-white border border-slate-300 focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-bold">Classification</label>
                                <select
                                  value={newType}
                                  onChange={(e) => setNewType(e.target.value as any)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                                >
                                  <option value="bad">Breach / Malicious Activity</option>
                                  <option value="good">Mitigation / Defensive Patch</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-bold">Severity</label>
                                <select
                                  value={newSeverity}
                                  onChange={(e) => setNewSeverity(e.target.value as any)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                                >
                                  <option value="critical">Critical (Priority Alpha)</option>
                                  <option value="high">High Level Alert</option>
                                  <option value="medium">Medium Baseline</option>
                                  <option value="low">Low Level Audit</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-bold">Immediate Action</label>
                                <input
                                  type="text"
                                  value={newAction}
                                  onChange={(e) => setNewAction(e.target.value)}
                                  placeholder="Enforce TLS constraints and scrub cache"
                                  className="w-full bg-white border border-slate-300 focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-bold">Technical Narrative</label>
                              <textarea
                                required
                                rows={2}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Describe telemetry anomalies detected."
                                className="w-full bg-white border border-slate-300 focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-sans"
                              />
                            </div>

                            {submitError && <div className="text-xs text-red-600 font-semibold">{submitError}</div>}

                            <button
                              type="submit"
                              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all border-none"
                            >
                              DEPLOY THREAT TELEMETRY DATA
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Integrated World Map Section */}
                    <div className="mb-5 space-y-2">
                      <WorldMapSVG />
                    </div>

                    {/* Threat List Column & Severity Bar Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Active Threat Signature Ticker Feed - Left Panel */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center space-x-1.5 text-red-600 border-b border-slate-100 pb-2 mb-4">
                            <Shield className="w-4 h-4 text-red-600 fill-red-50 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wider">ACTIVE THREAT SIGNATURES</span>
                          </div>

                          {/* Live Ticker Area */}
                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                            {/* Entry 1 */}
                            <div className="border-l-2 border-red-500 pl-3 py-0.5 text-[11px]">
                              <div className="flex justify-between items-center font-bold text-slate-800">
                                <span className="font-extrabold text-xs">Brute Force Blocked</span>
                                <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-mono">Port 443</span>
                              </div>
                              <p className="text-slate-500 font-sans mt-1 leading-relaxed">Automated mitigation engine restricted rogue IP nodes.</p>
                            </div>
                            
                            {/* Entry 2 */}
                            <div className="border-l-2 border-orange-500 pl-3 py-0.5 text-[11px]">
                              <div className="flex justify-between items-center font-bold text-slate-800">
                                <span className="font-extrabold text-xs">Phishing Simulation</span>
                                <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded font-mono">User Alert</span>
                              </div>
                              <p className="text-slate-500 font-sans mt-1 leading-relaxed">Identified rogue link payload originating outer zone.</p>
                            </div>

                            {/* Entry 3 */}
                            <div className="border-l-2 border-emerald-500 pl-3 py-0.5 text-[11px]">
                              <div className="flex justify-between items-center font-bold text-slate-800">
                                <span className="font-extrabold text-xs">DDoS Mitigation</span>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono animate-pulse">Active</span>
                              </div>
                              <p className="text-slate-500 font-sans mt-1 leading-relaxed">High volume telemetry traffic re-routed successfully.</p>
                            </div>

                            {/* User Logged Threats from Staff dynamically prepended/appended */}
                            {badThreats.map((t) => (
                              <div key={t.id} className="border-l-2 border-red-600 pl-3 py-0.5 text-[11px]">
                                <div className="flex justify-between items-center font-bold text-slate-800">
                                  <span className="font-extrabold text-xs truncate max-w-[150px]">{t.title}</span>
                                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-mono uppercase">{t.severity}</span>
                                </div>
                                <p className="text-slate-500 font-sans mt-1 leading-relaxed line-clamp-2">{t.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-[10px] text-red-600 uppercase font-black tracking-widest pt-3.5 border-t border-slate-100 mt-4 font-mono">
                          SEC_LEVEL // MONITORED STREAM
                        </div>
                      </div>

                      {/* Threat Severity Bar Chart - Right Panel */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2 mb-4">
                            <span className="text-cyan-500 font-mono font-black text-sm select-none">&gt;_</span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900">SEVERITY INDICES</span>
                          </div>

                          {/* Dynamic Bar chart representation */}
                          <div className="space-y-4">
                            {/* Metric 1 */}
                            <div>
                              <div className="flex justify-between text-[10px] font-extrabold text-slate-700 mb-1.5 uppercase font-mono tracking-wide">
                                <span>CRITICAL ALERTS (ALPHA)</span>
                                <span className="text-slate-900">85% SEVERITY</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-600 h-full rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                              </div>
                            </div>

                            {/* Metric 2 */}
                            <div>
                              <div className="flex justify-between text-[10px] font-extrabold text-slate-700 mb-1.5 uppercase font-mono tracking-wide">
                                <span>HIGH RISK VECTORS</span>
                                <span className="text-slate-900">62% INDEX</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: '62%' }}></div>
                              </div>
                            </div>

                            {/* Metric 3 */}
                            <div>
                              <div className="flex justify-between text-[10px] font-extrabold text-slate-700 mb-1.5 uppercase font-mono tracking-wide">
                                <span>MEDIUM BASELINE</span>
                                <span className="text-slate-900">38% OCCURRENCE</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '38%' }}></div>
                              </div>
                            </div>

                            {/* Metric 4 */}
                            <div>
                              <div className="flex justify-between text-[10px] font-extrabold text-slate-700 mb-1.5 uppercase font-mono tracking-wide">
                                <span>DEFENSIVE PATCHES (MITIGATED)</span>
                                <span className="text-slate-900">94% INTEGRITY</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: '94%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wider pt-3.5 border-t border-slate-100 mt-5 font-mono flex justify-between items-center">
                          <span>THREAT ENGINE</span>
                          <span className="text-blue-600 font-black tracking-widest">v1.16 SEC</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* CYBER SECURITY CAREER PLACEMENT GATEWAY HUB (Bottom Panel) */}
              {(activeTab === 'home' || activeTab === 'careers') && (
                <div id="career-placement-gateway" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-24 h-1 bg-teal-500"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">Cyber Security Career Hub</h2>
                        <p className="text-xs text-slate-500">Corporate connections, student placements, and high-fidelity alumni hiring vectors</p>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      Active Corporate Sync Established
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono flex justify-center items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>CONNECTING TO CAREER GATEWAY...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {displayCareers.map((c, idx) => {
                        // Dynamically assigning custom accent color classes for multi-colored gorgeous visual structure
                        const colors = [
                          { border: 'hover:border-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-100', leftBar: 'bg-blue-500' },
                          { border: 'hover:border-teal-400', badge: 'bg-teal-50 text-teal-700 border-teal-100', leftBar: 'bg-teal-500' },
                          { border: 'hover:border-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', leftBar: 'bg-indigo-500' }
                        ];
                        const theme = colors[idx % colors.length];

                        return (
                          <div key={c.id} className={`bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-all relative ${theme.border} hover:shadow-md overflow-hidden group`}>
                            {/* Colorful Accent Left-Bar */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${theme.leftBar}`} />
                            
                            <div>
                              <div className="flex justify-between items-start mb-3 pl-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{c.company}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${theme.badge} uppercase tracking-wider`}>
                                  {c.location}
                                </span>
                              </div>
                              
                              <h3 className="font-extrabold text-slate-900 text-base mb-2 pl-2 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                                {c.role}
                              </h3>
                              
                              {c.salary && (
                                <p className="text-xs text-emerald-600 font-bold mb-3 pl-2 font-mono">{c.salary}</p>
                              )}

                              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed mb-4 font-sans ml-2">
                                <span className="text-[10px] font-bold text-slate-800 uppercase block mb-1 font-mono tracking-wider">Required Skills:</span>
                                {c.requirements}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3.5 ml-2 font-mono">
                              <span className="text-orange-600 font-bold uppercase tracking-wider text-[11px]">
                                {c.vacancy} OPENINGS
                              </span>
                              
                              <button
                                id={`apply-career-${c.id}`}
                                onClick={() => handleSecureApply(c.id, c.role, c.company)}
                                className="relative flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-blue-700 transition-all cursor-pointer border-none group-hover:pr-6"
                              >
                                <span>SECURE APPLY</span>
                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Procedings expanded overlay (interactive confirmation backend) */}
                  <AnimatePresence>
                    {applyingJobId && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                      >
                        <motion.div 
                          initial={{ scale: 0.95, y: 15 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.95, y: 15 }}
                          className="max-w-md w-full bg-white border border-slate-200 p-6 rounded-xl shadow-xl text-center space-y-4 relative"
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                          
                          <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight">
                            Proceeding to Application Portal
                          </h3>
                          <p className="text-xs text-blue-600 font-mono bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100 inline-block">
                            Loading Secure Backend Form...
                          </p>

                          <div className="space-y-2 text-left bg-slate-50 border border-slate-200/60 rounded-lg p-3.5 font-mono text-[11px] text-slate-500">
                            <div className="flex justify-between items-center text-slate-700 font-bold mb-1.5 pb-1 border-b border-slate-200/60 uppercase">
                              <span>HANDSHAKE PROGRESS</span>
                              <span>{applyingProgress}%</span>
                            </div>
                            <p className="animate-pulse">{applyingStep}</p>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${applyingProgress}%` }}></div>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                            ENCRYPTED SECURE CHANNEL TLS 1.3 CLIENT-AUTH
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}

            </motion.div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-left"
            >
              
              {/* Multimedia Title Banner */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative shadow-sm">
                <div className="absolute top-0 left-0 w-24 h-1 bg-blue-600"></div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <span>Portal Multimedia Gallery Hub</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    Official department event photos, presentation records, seminar soundtracks, and technical audio archives
                  </p>
                </div>

                <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={() => setGalleryFilter('all')}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all rounded-md cursor-pointer ${
                      galleryFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Media
                  </button>
                  <button
                    onClick={() => setGalleryFilter('image')}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all rounded-md cursor-pointer ${
                      galleryFilter === 'image' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => setGalleryFilter('video')}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all rounded-md cursor-pointer ${
                      galleryFilter === 'video' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setGalleryFilter('audio')}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all rounded-md cursor-pointer ${
                      galleryFilter === 'audio' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Audio Tracks
                  </button>
                </div>
              </div>

              {/* Multimedia Upload and Layout Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Upload Panel (Uploader Zone) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-xl relative flex flex-col justify-between shadow-sm">
                  <div className="absolute top-0 left-0.5 w-16 h-1 bg-blue-600"></div>
                  
                  <div>
                    <h2 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase mb-4 pb-2 border-b border-slate-100">
                      SECURE MEDIA DEPLOYMENT TERMINAL
                    </h2>

                    {/* Drag-and-drop zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] group ${
                        isDragging 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/20'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                      />
                      <UploadCloud className={`w-10 h-10 mb-2.5 transition-transform duration-300 group-hover:scale-110 ${
                        isDragging ? 'text-emerald-500' : 'text-blue-500'
                      }`} />
                      
                      <p className="text-xs text-slate-700 font-bold tracking-wide leading-relaxed px-2">
                        {uploadFileName ? `Selected: ${uploadFileName}` : "Drag & Drop or Click to Upload Media"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider">
                        Supports: Images, Videos, Audio
                      </p>
                      {uploadFileSize && (
                        <p className="text-[10px] text-emerald-600 mt-2 font-mono font-bold uppercase tracking-wider">
                          SIZE: {uploadFileSize} // TYPE: {uploadType}
                        </p>
                      )}
                    </div>

                    {/* Metadata controls */}
                    <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-600 mb-1.5 uppercase font-bold tracking-wider">
                          Media Description / Event Caption
                        </label>
                        <input
                          type="text"
                          required
                          value={uploadCaption}
                          onChange={(e) => setUploadCaption(e.target.value)}
                          placeholder="e.g., Guest Lecture on IoT Botnets 2026"
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                        />
                      </div>

                      {uploadError && (
                        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 p-2 rounded-lg font-bold uppercase">
                          {uploadError}
                        </p>
                      )}
                      {uploadMessage && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg font-bold uppercase">
                          {uploadMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isUploading || !uploadBase64}
                        className={`w-full py-2.5 font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center space-x-1 border-none cursor-pointer ${
                          uploadBase64 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white mr-1" />
                            <span>UPLOADING PAYLOAD...</span>
                          </>
                        ) : (
                          <span>DEPLOY TO REPOSITORY</span>
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4 text-[10px] text-slate-400 leading-relaxed font-mono">
                    <p className="uppercase tracking-wider font-bold text-slate-500 mb-1">HANDSHAKE SECURITY:</p>
                    All multi-media assets are securely stored on our local server filesystem database. Max: ≤100MB.
                  </div>
                </div>

                {/* Media Archive Grid */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-xl relative flex flex-col justify-between shadow-sm">
                  <div className="absolute top-0 right-0 w-16 h-1 bg-blue-600"></div>
                  
                  <div>
                    <h2 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase mb-4 pb-2 border-b border-slate-100">
                      RELIABLE REPOSITORY STORAGE ARCHIVES ({filteredGallery.length} FILES)
                    </h2>

                    {filteredGallery.length === 0 ? (
                      <div className="py-20 text-center text-xs text-slate-400 uppercase tracking-wider border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        NO MEDIA ASSETS MATCHING FILTER CONSTRAINTS FOUND
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                        {filteredGallery.map((img) => (
                          <div 
                            key={img.id} 
                            className="bg-white border border-slate-100 rounded-xl p-3 hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between"
                          >
                            <div>
                              {/* Media Renderer based on type */}
                              {img.type === 'video' ? (
                                <div className="aspect-video w-full bg-slate-900 rounded-lg relative overflow-hidden group mb-2.5">
                                  <video 
                                    src={img.url} 
                                    className="w-full h-full object-cover" 
                                    controls 
                                    preload="metadata"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                                    <Film className="w-3 h-3" />
                                    <span>VIDEO</span>
                                  </div>
                                </div>
                              ) : img.type === 'audio' ? (
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mb-2.5 flex flex-col text-left space-y-2 relative overflow-hidden">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
                                      <Music className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 truncate">
                                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">AUDIO PLAYBACK</p>
                                      <p className="text-xs text-slate-800 font-semibold truncate max-w-[150px]">{img.caption}</p>
                                    </div>
                                  </div>

                                  {/* Waveform Visualization */}
                                  <div className="h-6 flex items-end justify-between space-x-0.5 px-2 bg-blue-50/20 py-1 border border-blue-100/10 rounded-lg">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                      <span 
                                        key={i} 
                                        style={{ height: `${Math.floor(Math.random() * 85) + 15}%` }}
                                        className={`w-[2px] bg-blue-500/60 rounded-full ${
                                          playingAudioId === img.id ? 'animate-[pulse_1.5s_infinite_ease-in-out]' : ''
                                        }`}
                                      />
                                    ))}
                                  </div>

                                  {/* Native player control */}
                                  <audio 
                                    src={img.url} 
                                    controls 
                                    onPlay={() => setPlayingAudioId(img.id)}
                                    onPause={() => setPlayingAudioId(null)}
                                    className="w-full h-6 text-xs bg-transparent mt-1"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video w-full bg-slate-100 rounded-lg relative overflow-hidden group mb-2.5 border border-slate-100">
                                  <img 
                                    src={img.url} 
                                    alt={img.caption} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>IMAGE</span>
                                  </div>
                                  
                                  {/* Zoom Trigger Button */}
                                  <button
                                    onClick={() => setZoomImage(img.url)}
                                    className="absolute bottom-2 right-2 p-1.5 bg-white/95 hover:bg-blue-600 hover:text-white rounded-lg text-slate-600 border border-slate-200 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Title Details */}
                              <div className="text-left mt-2 pl-1">
                                <h4 className="font-bold text-xs text-slate-800 tracking-wide leading-tight uppercase font-mono">
                                  {img.caption}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1.5 pt-2.5 border-t border-slate-100 uppercase font-bold">
                                  <span>SIZE: <span className="text-slate-600">{img.fileSize || '1.5 MB'}</span></span>
                                  <span>•</span>
                                  <span>FORMAT: <span className="text-blue-500">{img.fileType || 'image/png'}</span></span>
                                  <span>•</span>
                                  <span>DATE: <span className="text-teal-600">{img.uploadDate || '2026-07-14'}</span></span>
                                </div>
                              </div>
                            </div>

                            {/* Trash Action */}
                            <div className="flex justify-end mt-3 border-t border-slate-100 pt-2.5 pl-1">
                              <button
                                id={`delete-media-${img.id}`}
                                onClick={() => handleDeleteMedia(img.id)}
                                className="flex items-center space-x-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-100 hover:bg-red-500 hover:text-white bg-white rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>SCRUB</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-mono flex flex-wrap justify-between gap-2">
                    <span>SECURITY PARITY CHECK: HIGH INTEGRITY</span>
                    <span>ENCRYPTED SECURE SYSTEM</span>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ZOOM IMAGE MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 cursor-zoom-out backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[90vh] bg-white border border-slate-200 p-2 rounded-xl relative overflow-hidden shadow-2xl"
            >
              <img 
                src={zoomImage} 
                alt="Zoom view" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2.5 text-center font-mono font-bold">
                CLICK ANYWHERE TO EXIT HIGH RES VIEW
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
