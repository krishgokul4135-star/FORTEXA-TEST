/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Upload, Edit3, Trash2, Plus, Calendar, MapPin, Clock, 
  Megaphone, FolderHeart, Save, AlertCircle, Info, Image, Sparkles, User, ArrowUpRight, Eye, X
} from 'lucide-react';
import { User as UserType, EventItem } from '../types';

interface AssociationEventsProps {
  user: UserType;
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function AssociationEvents({ user, onBack, onNavigate }: AssociationEventsProps) {
  // Main states
  const [association, setAssociation] = useState({
    logo: '',
    name: 'Cyber Student & Staff Association (CSSA)',
    profileDescription: 'The Cyber Security Student & Staff Association (CSSA) coordinates threat intelligence symposiums, hackathons, guest lectures, and standard academic operations across the department.',
    schedule: 'Meetings every Wednesday at 15:30 in LH-102 (Cyber Sandbox Room).',
    president: 'John Doe',
    presidentPhoto: '',
    vicePresident: 'Jane Smith',
    vicePresidentPhoto: '',
    treasurer: 'Robert Brown',
    treasurerPhoto: '',
    managementHead: 'Dr. Evelyn Carter',
    cashierName: 'Prof. Sarah Connor'
  });

  const [events, setEvents] = useState<EventItem[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  // Left Panel Editable States (Association Profile & Management)
  const [editName, setEditName] = useState('Cyber Student & Staff Association (CSSA)');
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [president, setPresident] = useState('John Doe');
  const [presidentPhoto, setPresidentPhoto] = useState('');
  const [vicePresident, setVicePresident] = useState('Jane Smith');
  const [vicePresidentPhoto, setVicePresidentPhoto] = useState('');
  const [treasurer, setTreasurer] = useState('Robert Brown');
  const [treasurerPhoto, setTreasurerPhoto] = useState('');
  const [managementHead, setManagementHead] = useState('Dr. Evelyn Carter');
  const [cashierName, setCashierName] = useState('Prof. Sarah Connor');

  // Hidden File Inputs Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const presidentInputRef = useRef<HTMLInputElement>(null);
  const vpInputRef = useRef<HTMLInputElement>(null);
  const treasurerInputRef = useRef<HTMLInputElement>(null);

  // Event Tracker states (Right Panel)
  const [showEmbeddedForm, setShowEmbeddedForm] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  // Notice form state
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // Gallery form state
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageBase64, setGalleryImageBase64] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAllData = async () => {
    try {
      const [assocRes, eventsRes, galleryRes] = await Promise.all([
        fetch('/api/association'),
        fetch('/api/events'),
        fetch('/api/gallery')
      ]);

      const assocData = await assocRes.json();
      const eventsData = await eventsRes.json();
      const galleryData = await galleryRes.json();

      setAssociation(assocData);
      
      // Map to editable states
      setEditName(assocData.name || 'Cyber Student & Staff Association (CSSA)');
      setEditDesc(assocData.profileDescription || '');
      setEditSchedule(assocData.schedule || '');
      setLogoBase64(assocData.logo || '');
      setPresident(assocData.president || 'John Doe');
      setPresidentPhoto(assocData.presidentPhoto || '');
      setVicePresident(assocData.vicePresident || 'Jane Smith');
      setVicePresidentPhoto(assocData.vicePresidentPhoto || '');
      setTreasurer(assocData.treasurer || 'Robert Brown');
      setTreasurerPhoto(assocData.treasurerPhoto || '');
      setManagementHead(assocData.managementHead || 'Dr. Evelyn Carter');
      setCashierName(assocData.cashierName || 'Prof. Sarah Connor');

      setEvents(eventsData.events || []);
      setNotices(eventsData.notices || []);
      setGallery(galleryData || []);
    } catch (err) {
      console.error('Error fetching association datasets:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update Association Profile (Editable by real-time users)
  const handleUpdateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/association/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo: logoBase64,
          name: editName,
          profileDescription: editDesc,
          schedule: editSchedule,
          president,
          presidentPhoto,
          vicePresident,
          vicePresidentPhoto,
          treasurer,
          treasurerPhoto,
          managementHead,
          cashierName
        })
      });

      if (!response.ok) throw new Error('Failed to update association profile.');
      const data = await response.json();
      setAssociation(data);
      setMessage('Association profile compiled successfully!');
      
      // Scroll to top of status
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Error occurred updating profile.');
    }
  };

  // Handle Logo Upload (Base64 Reader)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Core Members Photos Upload (Base64 Reader)
  const handleMemberPhotoChange = (e: React.ChangeEvent<HTMLInputElement>, role: 'president' | 'vicePresident' | 'treasurer') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (role === 'president') setPresidentPhoto(base64);
        if (role === 'vicePresident') setVicePresidentPhoto(base64);
        if (role === 'treasurer') setTreasurerPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Event form (Embedded inline above the list)
  const openEventForm = (mode: 'add' | 'edit', event?: EventItem) => {
    setModalMode(mode);
    if (mode === 'edit' && event) {
      setSelectedEventId(event.id);
      setEventTitle(event.title);
      setEventDate(event.date);
      setEventTime(event.time);
      setEventVenue(event.venue);
      setEventDesc(event.description);
    } else {
      setSelectedEventId(null);
      setEventTitle('');
      setEventDate('');
      setEventTime('');
      setEventVenue('');
      setEventDesc('');
    }
    setShowEmbeddedForm(true);
    
    // Smooth scroll down to the events header area
    const element = document.getElementById('events-section-header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Create or Update Event
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      venue: eventVenue,
      description: eventDesc
    };

    try {
      let response;
      if (modalMode === 'add') {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`/api/events/${selectedEventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) throw new Error('Event compilation server error.');
      
      setShowEmbeddedForm(false);
      fetchAllData();
      setMessage(modalMode === 'add' ? 'Event successfully cataloged!' : 'Event successfully revised!');
    } catch (err: any) {
      setError(err.message || 'Error processing event.');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to scrub this event from CSSA registries?')) return;
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete response failed.');
      fetchAllData();
      setMessage('Event scrubbed successfully from ledger.');
    } catch (err: any) {
      setError(err.message || 'Error erasing event.');
    }
  };

  // Broadcast Notice Submit
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!noticeTitle || !noticeContent) return;

    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          author: `${user.username} (${user.role})`
        })
      });

      if (!response.ok) throw new Error('Broadcast submission rejected.');
      setNoticeTitle('');
      setNoticeContent('');
      setShowNoticeForm(false);
      fetchAllData();
      setMessage('Program announcement broadcasted successfully!');
    } catch (err: any) {
      setError(err.message || 'Notice submission error.');
    }
  };

  // Gallery Upload File handler
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Gallery Photo
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!galleryImageBase64) {
      setError('Please select/upload an image file first.');
      return;
    }

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: galleryImageBase64,
          caption: galleryCaption
        })
      });

      if (!response.ok) throw new Error('Gallery post rejected.');
      setGalleryCaption('');
      setGalleryImageBase64('');
      setShowGalleryUpload(false);
      fetchAllData();
      setMessage('New event photo added to CSSA media repository!');
    } catch (err: any) {
      setError(err.message || 'Gallery upload failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#f3f4f6] font-mono px-4 md:px-8 py-6 flex flex-col">
      
      {/* Navigation & Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs text-[#00f2ff] border border-[#00f2ff]/20 bg-[#00f2ff]/5 px-3.5 py-1.5 rounded-sm transition-all cursor-pointer self-start uppercase tracking-widest font-bold hover:bg-[#00f2ff]/15"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO CONTROL PORTAL</span>
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-widest text-[#f3f4f6] uppercase glow-text">CSSA Association & Event Workspace</h1>
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest">CYBER STUDENT & STAFF ASSOCIATION // PUBLIC & ADMIN OPERATIONS</p>
        </div>
      </div>

      {/* Global Status messages */}
      <div className="max-w-7xl mx-auto w-full">
        {message && (
          <div className="border border-[#00ffa3]/40 bg-[#00ffa3]/10 text-[#00ffa3] p-3 rounded-sm text-xs mb-4 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping"></span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="border border-[#ff2d55]/40 bg-[#ff2d55]/10 text-[#ff2d55] p-3 rounded-sm text-xs mb-4 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-ping"></span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Grid: Left Column (Association Profile & Management), Right Column (Events Management & Gallery) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Section 1: Association Profile & Management Card */}
          <div className="bg-[#101218] border border-[#1f2937] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00f2ff]/5 to-transparent pointer-events-none"></div>
            
            <div className="border-b border-[#1f2937] pb-3 mb-5">
              <h2 className="text-xs font-extrabold text-[#00f2ff] uppercase tracking-widest">
                Section 1: CSSA ASSOCIATION PROFILE & MANAGEMENT
              </h2>
              <p className="text-[9px] text-[#9ca3af] uppercase tracking-wider font-sans mt-0.5">
                Maintain department identity, leadership roles, and logs cashiers
              </p>
            </div>

            <form onSubmit={handleUpdateAssociation} className="space-y-6">
              
              {/* Logo upload and Name input block */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                
                {/* Logo Upload Box (Prominent square container with dotted border) */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1 font-mono">ASSOCIATION EMBLEM</span>
                  <div 
                    className="w-28 h-28 rounded-lg bg-[#050608] border-2 border-dashed border-[#00f2ff]/30 hover:border-[#00f2ff] transition-all flex flex-col items-center justify-center p-2 text-center relative overflow-hidden group"
                  >
                    {logoBase64 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={logoBase64}
                          alt="CSSA Logo Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1.5 p-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLogoZoomed(true);
                            }}
                            className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] uppercase tracking-wider rounded border-none cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>View Large</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              logoInputRef.current?.click();
                            }}
                            className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[8px] uppercase tracking-wider rounded border border-slate-700 cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Upload className="w-2.5 h-2.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="flex flex-col items-center text-center cursor-pointer h-full justify-center"
                      >
                        <Upload className="w-6 h-6 text-[#00f2ff]/50 group-hover:text-[#00f2ff] transition-colors" />
                        <span className="text-[8px] text-[#00f2ff]/75 font-semibold mt-1 leading-snug">
                          Click to Upload Association Logo
                        </span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoBase64('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdwKNyXQNhpg5ZifEMAA2hKCa_qiOFI4w-7eVEi7jgNw&s=10');
                    }}
                    className="mt-2 text-[8px] text-[#00f2ff]/80 hover:text-[#00f2ff] bg-[#00f2ff]/5 hover:bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded px-2 py-1 font-mono tracking-wider transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-[#00f2ff]" />
                    <span>LOAD FORTEXA EXAMPLE</span>
                  </button>
                </div>

                {/* Editable Association Name */}
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                    Association Name / Node Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Cyber Student & Staff Association (CSSA)"
                    className="w-full bg-[#050608] border border-slate-800 focus:border-[#00f2ff] rounded-md px-3 py-2 text-xs text-white font-bold tracking-wide focus:outline-none focus:ring-1 focus:ring-[#00f2ff]/20"
                  />

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                      Department Profile Bio
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Enter profile bio..."
                      className="w-full bg-[#050608] border border-slate-800 focus:border-[#00f2ff] rounded-md p-2 text-[11px] text-gray-300 focus:outline-none resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Assembly Meeting Schedule */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                  Academic Assembly Schedule
                </label>
                <input
                  type="text"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  placeholder="Meetings schedule..."
                  className="w-full bg-[#050608] border border-slate-800 focus:border-[#00f2ff] rounded-md px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
                />
              </div>

              {/* Office Bearers & Leadership Grid */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#1f2937] pb-1.5">
                  <h3 className="text-[10px] font-black text-gray-200 uppercase tracking-widest">
                    Office Bearers & Leadership Grid
                  </h3>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wider font-mono">
                    Click avatars to upload bearer photographs
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  
                  {/* President Card */}
                  <div className="bg-[#050608] border border-slate-800 rounded-lg p-2.5 flex flex-col items-center space-y-2 relative group hover:border-cyan-500/30 transition-all">
                    <div 
                      onClick={() => presidentInputRef.current?.click()}
                      className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer relative group-hover:border-[#00f2ff]/50"
                    >
                      {presidentPhoto ? (
                        <img 
                          src={presidentPhoto} 
                          alt="President" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                          <span className="text-[6px] mt-0.5 uppercase tracking-widest font-mono">UPLOAD</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={presidentInputRef}
                      accept="image/*"
                      onChange={(e) => handleMemberPhotoChange(e, 'president')}
                      className="hidden" 
                    />

                    <div className="w-full text-center space-y-1">
                      <span className="text-[7px] text-[#00f2ff] uppercase font-bold tracking-widest block font-mono">PRESIDENT</span>
                      <input 
                        type="text" 
                        required
                        value={president}
                        onChange={(e) => setPresident(e.target.value)}
                        placeholder="President Name"
                        className="w-full bg-[#101218] border border-slate-900 text-center text-[9px] text-white px-1 py-0.5 rounded-sm focus:outline-none focus:border-[#00f2ff]"
                      />
                    </div>
                  </div>

                  {/* Vice President Card */}
                  <div className="bg-[#050608] border border-slate-800 rounded-lg p-2.5 flex flex-col items-center space-y-2 relative group hover:border-cyan-500/30 transition-all">
                    <div 
                      onClick={() => vpInputRef.current?.click()}
                      className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer relative group-hover:border-[#00f2ff]/50"
                    >
                      {vicePresidentPhoto ? (
                        <img 
                          src={vicePresidentPhoto} 
                          alt="VP" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                          <span className="text-[6px] mt-0.5 uppercase tracking-widest font-mono">UPLOAD</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={vpInputRef}
                      accept="image/*"
                      onChange={(e) => handleMemberPhotoChange(e, 'vicePresident')}
                      className="hidden" 
                    />

                    <div className="w-full text-center space-y-1">
                      <span className="text-[7px] text-[#00f2ff] uppercase font-bold tracking-widest block font-mono">VICE PRESIDENT</span>
                      <input 
                        type="text" 
                        required
                        value={vicePresident}
                        onChange={(e) => setVicePresident(e.target.value)}
                        placeholder="VP Name"
                        className="w-full bg-[#101218] border border-slate-900 text-center text-[9px] text-white px-1 py-0.5 rounded-sm focus:outline-none focus:border-[#00f2ff]"
                      />
                    </div>
                  </div>

                  {/* Treasurer Card */}
                  <div className="bg-[#050608] border border-slate-800 rounded-lg p-2.5 flex flex-col items-center space-y-2 relative group hover:border-cyan-500/30 transition-all">
                    <div 
                      onClick={() => treasurerInputRef.current?.click()}
                      className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer relative group-hover:border-[#00f2ff]/50"
                    >
                      {treasurerPhoto ? (
                        <img 
                          src={treasurerPhoto} 
                          alt="Treasurer" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                          <span className="text-[6px] mt-0.5 uppercase tracking-widest font-mono">UPLOAD</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={treasurerInputRef}
                      accept="image/*"
                      onChange={(e) => handleMemberPhotoChange(e, 'treasurer')}
                      className="hidden" 
                    />

                    <div className="w-full text-center space-y-1">
                      <span className="text-[7px] text-[#00f2ff] uppercase font-bold tracking-widest block font-mono">TREASURER</span>
                      <input 
                        type="text" 
                        required
                        value={treasurer}
                        onChange={(e) => setTreasurer(e.target.value)}
                        placeholder="Treasurer Name"
                        className="w-full bg-[#101218] border border-slate-900 text-center text-[9px] text-white px-1 py-0.5 rounded-sm focus:outline-none focus:border-[#00f2ff]"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Management & Cashier Details subsection */}
              <div className="space-y-3 pt-2 bg-[#050b12] border border-slate-800 rounded-lg p-4">
                <div className="border-b border-[#1f2937] pb-1">
                  <h4 className="text-[9px] font-black text-[#00ffa3] uppercase tracking-wider font-mono">
                    Financial Management Roles
                  </h4>
                  <p className="text-[7px] text-gray-500 uppercase tracking-wider font-mono">
                    Assign which users authorize funds and maintain log ledgers
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-gray-400 uppercase tracking-widest font-bold">
                      Management Head
                    </label>
                    <input
                      type="text"
                      required
                      value={managementHead}
                      onChange={(e) => setManagementHead(e.target.value)}
                      placeholder="e.g. Dr. Evelyn Carter"
                      className="w-full bg-[#101218] border border-slate-800 focus:border-[#00f2ff] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-gray-400 uppercase tracking-widest font-bold">
                      Cashier Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="e.g. Prof. Sarah Connor"
                      className="w-full bg-[#101218] border border-slate-800 focus:border-[#00f2ff] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save changes action */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#00f2ff] hover:bg-cyan-400 text-black font-black text-xs tracking-widest transition-all rounded-md flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.15)] uppercase"
              >
                <Save className="w-4 h-4" />
                <span>COMPILE & SAVE ASSOCIATION PROFILE</span>
              </button>

            </form>
          </div>

          {/* Broadcast Notice Board */}
          <div className="bg-[#070e17] border border-slate-800 rounded-xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-emerald-400 animate-bounce" />
                <h2 className="text-xs font-extrabold text-gray-200 uppercase tracking-widest">Broadcast Notice Board</h2>
              </div>
              
              <button
                id="add-notice-toggle-button"
                onClick={() => setShowNoticeForm(!showNoticeForm)}
                className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded cursor-pointer"
              >
                {showNoticeForm ? 'COLLAPSE' : 'BROADCAST NOTICE'}
              </button>
            </div>

            {/* Notice Addition form */}
            <AnimatePresence>
              {showNoticeForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleNoticeSubmit}
                  className="bg-[#03070d] border border-slate-800/80 p-3 rounded mb-4 space-y-3 text-left overflow-hidden"
                >
                  <h4 className="text-[10px] text-cyan-400 uppercase tracking-widest">Post Announcement Package</h4>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase mb-0.5">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="e.g. Critical Update on Regulation Labs"
                      className="w-full bg-[#010306] border border-slate-800 rounded px-2 py-1 text-xs text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase mb-0.5">Message / Invitation Details</label>
                    <textarea
                      required
                      rows={3}
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      placeholder="Enter details visible to students and staff"
                      className="w-full bg-[#010306] border border-slate-800 rounded p-2 text-xs text-gray-300 resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      id="submit-notice-button"
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[10px] rounded cursor-pointer"
                    >
                      TRANSMIT NOTICE TO ALL
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Broadcast Notices List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {notices.map((n) => (
                <div key={n.id} className="p-3 bg-[#050b12] border border-slate-800 rounded text-[11px] hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-1 mb-1.5">
                    <span className="font-bold text-emerald-400 uppercase">{n.title}</span>
                    <span className="text-[9px] text-gray-500">{n.date}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-2 whitespace-pre-wrap">{n.content}</p>
                  <div className="text-[9px] text-gray-500 text-right">
                    Dispatched by: <span className="font-bold text-gray-400">{n.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Span 7) */}
        <div id="events-section-header" className="lg:col-span-7 space-y-8">
          
          {/* Section 2: Active Events Tracker card */}
          <div className="bg-[#070e17] border border-slate-800 rounded-xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h2 className="text-xs font-extrabold text-[#00f2ff] uppercase tracking-widest">
                  Section 2: ACTIVE CSSA CALENDARED EVENTS
                </h2>
                <p className="text-[8px] text-gray-500 uppercase font-mono tracking-wider mt-0.5">
                  Track dynamic event records and direct registration ledger sheets
                </p>
              </div>
              
              <button
                id="add-event-toggle-button"
                onClick={() => {
                  if (showEmbeddedForm && modalMode === 'add') {
                    setShowEmbeddedForm(false);
                  } else {
                    openEventForm('add');
                  }
                }}
                className="flex items-center space-x-1.5 text-[9px] font-black text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 bg-cyan-950/20 px-3 py-1.5 rounded cursor-pointer uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Event</span>
              </button>
            </div>

            {/* EMBEDDED FORM RIGHT ABOVE EVENTS LIST */}
            <AnimatePresence>
              {showEmbeddedForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleEventSubmit}
                  className="bg-[#03070d] border-2 border-cyan-500/30 p-4 rounded-xl mb-6 space-y-4 text-left overflow-hidden shadow-[0_0_20px_rgba(0,242,255,0.05)]"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1">
                    <h4 className="text-[10px] text-cyan-400 uppercase font-black tracking-widest flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>{modalMode === 'add' ? 'Assemble New CSSA Event Payload' : 'Revise Existing CSSA Event'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowEmbeddedForm(false)}
                      className="text-[10px] text-gray-500 hover:text-gray-300"
                    >
                      CLOSE
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Event Title</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Annual Cyber Defense Hackathon"
                        className="w-full bg-[#010306] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#010306] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Time</label>
                      <input
                        type="text"
                        required
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        placeholder="e.g. 09:00 - 18:00"
                        className="w-full bg-[#010306] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Venue</label>
                      <input
                        type="text"
                        required
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g. Cyber Security Laboratory"
                        className="w-full bg-[#010306] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Event Description / Agenda</label>
                    <textarea
                      required
                      rows={3}
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="Describe event agendas, challenges, guest profile, or prerequisites..."
                      className="w-full bg-[#010306] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800/50">
                    <button
                      type="button"
                      onClick={() => setShowEmbeddedForm(false)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-400 rounded text-[10px] uppercase font-bold cursor-pointer"
                    >
                      ABORT
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-black rounded text-[10px] uppercase cursor-pointer"
                    >
                      {modalMode === 'add' ? 'COMMIT EVENT' : 'SAVE CHANGES'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Event List */}
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center italic">No scheduled events logged in CSSA databases.</p>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="p-4 bg-[#050b12] border border-slate-800 hover:border-[#00f2ff]/30 rounded-lg flex flex-col justify-between transition-all group relative">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"></div>
                        <h3 className="font-extrabold text-gray-100 text-xs uppercase tracking-wider group-hover:text-[#00f2ff] transition-colors">{e.title}</h3>
                      </div>
                      
                      <p className="text-gray-300 text-[11px] leading-relaxed">{e.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 font-mono">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-500/70" />
                          <span>{e.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-500/70" />
                          <span>{e.time}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500/70" />
                          <span>{e.venue}</span>
                        </span>
                      </div>
                    </div>

                    {/* ALWAYS VISIBLE EVENT OPERATIONS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 mt-3 pt-3">
                      
                      {/* Manage Registrations hyperlink button (interconnected view link) */}
                      <button
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('funds');
                          } else {
                            alert('Funds view navigation not bound inside current props.');
                          }
                        }}
                        className="text-[10px] font-black text-[#00ffa3] hover:text-[#00ffa3]/80 transition-all flex items-center space-x-1 hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#00ffa3]" />
                        <span>Manage Registrations</span>
                      </button>

                      {/* Edit Event & Delete Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEventForm('edit', e)}
                          className="px-2.5 py-1 text-[9px] bg-cyan-950/40 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 rounded font-bold text-cyan-400 transition-all cursor-pointer flex items-center space-x-1 uppercase"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Event</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="px-2.5 py-1 text-[9px] bg-red-950/20 hover:bg-red-500 hover:text-white border border-red-500/20 rounded font-bold text-red-400 transition-all cursor-pointer flex items-center space-x-1 uppercase"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Event Gallery (Media Folder layout) */}
          <div className="bg-[#070e17] border border-slate-800 rounded-xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FolderHeart className="w-4 h-4 text-[#00f2ff]" />
                <h2 className="text-xs font-extrabold text-gray-200 uppercase tracking-widest">CSSA CSS_FOLDER // Dynamic Event Gallery</h2>
              </div>
              
              <button
                id="add-photo-toggle-button"
                onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded cursor-pointer"
              >
                {showGalleryUpload ? 'COLLAPSE' : 'UPLOAD EVENT PHOTO'}
              </button>
            </div>

            {/* Gallery photo submission form */}
            <AnimatePresence>
              {showGalleryUpload && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleGallerySubmit}
                  className="bg-[#03070d] border border-slate-800/80 p-3 rounded mb-4 space-y-3 text-left overflow-hidden"
                >
                  <h4 className="text-[10px] text-cyan-400 uppercase tracking-widest">Upload Event Asset</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase mb-0.5">Select Image File</label>
                      <input
                        type="file"
                        required
                        accept="image/*"
                        onChange={handleGalleryFileChange}
                        className="text-[10px] text-gray-400 bg-[#010306] border border-slate-800 p-1 rounded w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase mb-0.5">Event Caption</label>
                      <input
                        type="text"
                        required
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                        placeholder="e.g. Students demonstrating zero-day exploits"
                        className="w-full bg-[#010306] border border-slate-800 rounded px-2.5 py-1 text-xs text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      id="submit-gallery-button"
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[10px] rounded cursor-pointer"
                    >
                      COMMIT EVENT PHOTO TO GALLERY
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Gallery Folder layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {gallery.map((img) => (
                <div key={img.id} className="bg-[#050b12] border border-slate-800 rounded-lg overflow-hidden group shadow-md hover:border-slate-700 transition-all">
                  <div className="h-28 overflow-hidden bg-slate-950 relative">
                    <img
                      src={img.url}
                      alt={img.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/75 rounded text-[7px] text-[#00f2ff] uppercase tracking-widest">
                      CSSA_MEDIA
                    </div>
                  </div>
                  <p className="p-2 text-[10px] text-gray-400 line-clamp-2 leading-snug">{img.caption}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* Elegant Large Lightbox view overlay for Association Emblem */}
      <AnimatePresence>
        {isLogoZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLogoZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#101218] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 text-left"
            >
              {/* Close button */}
              <button
                onClick={() => setIsLogoZoomed(false)}
                className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Image frame */}
                <div className="w-full sm:w-1/2 rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center p-2 shadow-inner">
                  <img
                    src={logoBase64 || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdwKNyXQNhpg5ZifEMAA2hKCa_qiOFI4w-7eVEi7jgNw&s=10'}
                    alt="Association High-Res Emblem"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain max-h-[50vh] rounded-lg"
                  />
                </div>

                {/* Metadata & telemetry stats */}
                <div className="flex-1 flex flex-col justify-between py-1 text-slate-300">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 uppercase tracking-widest mb-3">
                      CSSA SECURITY EMBLEM
                    </span>
                    <h3 className="text-base font-extrabold text-white tracking-widest uppercase font-mono">
                      {editName}
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">
                      NODE_ID: CSSA-LOGO-GEN // STATUS: ACTIVE
                    </p>

                    <div className="mt-4 space-y-3 text-[11px] font-sans border-t border-slate-800 pt-3 text-slate-400">
                      <p className="leading-relaxed">
                        Authorized active association crest loaded into current runtime context. Built on Fortexa secure shield design parameters.
                      </p>
                      
                      <div className="bg-[#050608] rounded-lg p-3 border border-slate-800 font-mono space-y-1 text-[9px] text-slate-400">
                        <div><span className="text-[#00f2ff] font-bold">ALGORITHM:</span> SHA-512 SECURE</div>
                        <div><span className="text-[#00f2ff] font-bold">RESOLUTION:</span> VECTOR LAYER</div>
                        <div><span className="text-[#00f2ff] font-bold">LEADER:</span> {president}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-0 pt-3 border-t border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>SECURITY COGNITIVE ASSET</span>
                    <button
                      onClick={() => setIsLogoZoomed(false)}
                      className="text-[#00f2ff] hover:text-cyan-400 font-bold transition-colors cursor-pointer border-none bg-none"
                    >
                      [CLOSE VIEWER]
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
