/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, KeyRound, Terminal, Radio, Eye, X, Upload, 
  RotateCcw, Sparkles, Check, Link2, Info 
} from 'lucide-react';
// @ts-ignore
import defaultLogo from '../assets/images/fortexa_logo_1784045039532.jpg';

interface WelcomePageProps {
  onEnter: () => void;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  
  // Dynamic state for active portal logo with local storage persistence
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('CYBER_PORTAL_LOGO') || defaultLogo;
  });

  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload base64 generator
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Error: Only image files are supported.');
      setTimeout(() => setUploadMessage(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogo(base64String);
      localStorage.setItem('CYBER_PORTAL_LOGO', base64String);
      setUploadMessage('Portal emblem updated successfully via secure file upload!');
      setTimeout(() => setUploadMessage(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop event handlers
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
      processFile(file);
    }
  };

  // Link input upload handler
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setLogo(customUrl.trim());
      localStorage.setItem('CYBER_PORTAL_LOGO', customUrl.trim());
      setCustomUrl('');
      setUploadMessage('Portal emblem updated successfully via remote image URL!');
      setTimeout(() => setUploadMessage(''), 4000);
    }
  };

  // Reset logo back to Fortexa standard
  const handleResetLogo = () => {
    setLogo(defaultLogo);
    localStorage.removeItem('CYBER_PORTAL_LOGO');
    setUploadMessage('Portal emblem restored to Fortexa defaults.');
    setTimeout(() => setUploadMessage(''), 4000);
  };

  return (
    <div id="welcome-container" className="relative flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans select-none px-4 md:px-8">
      {/* Hidden File Input for Logo upload */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Cinematic Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
      
      {/* Friendly Light Status Indicators on Edges */}
      <div className="absolute top-6 left-6 hidden lg:flex items-center space-x-2 text-slate-500 text-xs tracking-wider font-mono">
        <Terminal className="w-4 h-4 text-blue-600" />
        <span>SECURE HANDSHAKE NODE READY</span>
      </div>
      <div className="absolute top-6 right-6 hidden lg:flex items-center space-x-2 text-slate-500 text-xs tracking-wider font-mono">
        <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
        <span>PORTAL INGRESS: PORT 3000 // ONLINE</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-3xl text-center"
      >
        {/* Shield Cyber Indicator */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-600 mb-6 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>

        {/* Dynamic Landscape Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 uppercase">
          Smart Entry to Cyber Web Portal
        </h1>
        
        <p className="text-slate-600 text-sm md:text-base tracking-wide max-w-xl mb-6 leading-relaxed font-sans">
          Authorized Academic and Administrative Operations Console. Multi-tenant secure records management, threat telemetry feeds, and real-time ledger accounting.
        </p>

        {/* Upload success notification banner */}
        <AnimatePresence>
          {uploadMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 max-w-md w-full px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              {uploadMessage.includes('Error') ? (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              ) : (
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{uploadMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Cyber Security Department Logo Frame */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group mb-10 transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
        >
          {/* Decorative Framing Angles */}
          <div className="absolute -top-3 -left-3 w-5 h-5 border-t-2 border-l-2 border-blue-600 rounded-tl"></div>
          <div className="absolute -top-3 -right-3 w-5 h-5 border-t-2 border-r-2 border-blue-600 rounded-tr"></div>
          <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b-2 border-l-2 border-blue-600 rounded-bl"></div>
          <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b-2 border-r-2 border-blue-600 rounded-br"></div>

          {/* Drag and Drop Indication Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50/95 border-2 border-dashed border-blue-600 rounded-2xl z-20 flex flex-col items-center justify-center p-4">
              <Upload className="w-10 h-10 text-blue-600 animate-bounce" />
              <span className="text-xs font-bold text-blue-800 uppercase tracking-widest mt-2 font-mono">Drop Image Here</span>
            </div>
          )}

          {/* Subtle Soft shadow */}
          <div className="absolute inset-0 rounded-2xl bg-blue-600/5 blur-xl opacity-80 group-hover:bg-blue-600/10 transition-all duration-700"></div>

          {/* The actual generated Image */}
          <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2 shadow-lg transition-transform duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            <img 
              src={logo} 
              alt="Cyber Security Department Emblem" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl transition-all duration-700 filter contrast-100 brightness-100"
            />
            
            {/* Elegant hover overlay */}
            <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-5 space-y-2.5">
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border-none cursor-pointer flex items-center justify-center space-x-2 shadow transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Configure / Zoom</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 cursor-pointer flex items-center justify-center space-x-2 shadow transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Custom</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enter Button with Premium Feedback */}
        <div className="relative">
          <motion.button
            id="enter-portal-button"
            onClick={onEnter}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer border-none"
          >
            <KeyRound className="w-5 h-5" />
            <span>Click Here to Enter</span>
          </motion.button>
          
          <div className="text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            SECURE ACCESS HANDSHAKE PROTOCOL ACTIVATED
          </div>
        </div>
      </motion.div>

      {/* Elegant Large Lightbox view overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 md:p-8 text-left"
            >
              {/* Close button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Large high resolution image representation */}
                <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-slate-800 bg-black flex flex-col items-center justify-center p-4 shadow-inner">
                  <div className="relative w-full aspect-square max-h-[45vh] flex items-center justify-center bg-zinc-900 rounded-lg p-2">
                    <img
                      src={logo}
                      alt="Cyber Security Department High-Res Emblem"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  
                  {logo !== defaultLogo && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="mt-4 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/40 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>RESTORE DEFAULT EMBLEM</span>
                    </button>
                  )}
                </div>

                {/* Metadata & interactive configuration panel */}
                <div className="flex-1 flex flex-col justify-between py-1 text-slate-300">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-900 uppercase tracking-widest">
                        Portal Logo Configurator
                      </span>
                      <h3 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-2">
                        Smart Entry Web Emblem
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                        Active Mode: {logo === defaultLogo ? 'Standard Fortexa Shield' : 'Custom Association Emblem'}
                      </p>
                    </div>

                    {/* Integrated custom change console */}
                    <div className="border-t border-b border-slate-900 py-4 space-y-4">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>UPDATE SYSTEM EMBLEM LOGO</span>
                      </div>

                      {/* Local File Upload zone */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-800 hover:border-blue-600/50 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />
                        <div>
                          <span className="text-xs text-slate-200 font-bold block">Drag & drop or Click to Upload</span>
                          <span className="text-[10px] text-slate-500 font-mono">PNG, JPG, SVG or WebP formats supported</span>
                        </div>
                      </div>

                      {/* Image link option */}
                      <form onSubmit={handleUrlSubmit} className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Or paste remote image address link</span>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Link2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-600" />
                            <input
                              type="url"
                              value={customUrl}
                              onChange={(e) => setCustomUrl(e.target.value)}
                              placeholder="https://example.com/logo.png"
                              className="w-full bg-[#090b0f] border border-slate-800 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg border-none cursor-pointer transition-all"
                          >
                            Apply Link
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Static verification metadata stats */}
                    <div className="space-y-2.5 bg-slate-900/40 rounded-xl p-3.5 border border-slate-900/60 text-xs text-slate-400 font-sans">
                      <div className="flex items-start gap-2 text-slate-500 leading-normal">
                        <Info className="w-4 h-4 text-blue-500/80 shrink-0 mt-0.5" />
                        <span className="text-[11px]">
                          Changes made to this web emblem will persist in the local browser profile cache context.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>SECURITY COGNITIVE ASSET</span>
                    <button
                      onClick={() => setIsZoomed(false)}
                      className="text-blue-500 hover:text-blue-400 font-bold transition-colors cursor-pointer border-none bg-none"
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
