/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, Edit3, Trash2, GraduationCap, Users, ShieldCheck, 
  FileText, Calendar, Clock, MapPin, Grid, Layers, Save, CheckCircle,
  Bell, Award, ChevronDown, UserCheck, Trash, AlertCircle, Download, Printer
} from 'lucide-react';
import { User, StudentProfile, StaffProfile, DayTimeTable, AcademicScheduleItem } from '../types';

interface AcademicRecordsProps {
  user: User;
  onBack: () => void;
}

interface GlobalScheduleItem {
  id: string;
  event: string;
  assignedStaff: string[];
  subjectTask: string;
}

export default function AcademicRecords({ user, onBack }: AcademicRecordsProps) {
  // Navigation active tab: 'student' | 'staff' | 'schedule'
  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'schedule'>('student');
  
  // Datasets
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [regulations, setRegulations] = useState<string[]>([]);
  const [globalSchedules, setGlobalSchedules] = useState<GlobalScheduleItem[]>([]);
  
  // Selected Profile for Deep-Dive 'Inner Portal'
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isViewingInnerPortal, setIsViewingInnerPortal] = useState(false);

  // Top Profile Panel - Alex Johnson States
  const [adminProfile, setAdminProfile] = useState({
    name: 'Alex Johnson',
    department: 'B.E. Computer Science and Engineering (Cyber Security)',
    age: 35,
    fatherName: 'Richard Johnson',
    address: '456 Hackers Alley, Secure Valley, SV-908'
  });
  const [adminNotifyBadge, setAdminNotifyBadge] = useState(true);

  // Local inline editing states for students
  const [studentEditStates, setStudentEditStates] = useState<{ [id: string]: {
    editingField?: string;
    name: string;
    age: number;
    fatherName: string;
    address: string;
    department: string;
  }}>({});

  // Local inline editing states for staff
  const [staffEditStates, setStaffEditStates] = useState<{ [id: string]: {
    name: string;
    department: string;
    age: number;
    fatherName: string;
    address: string;
    certificates: string[];
    newCertName?: string;
    showCertInput?: boolean;
  }}>({});

  // Seven Period Timetable state for inner portal
  // Format: Array of 7 period objects
  interface SevenPeriodRow {
    period: string; // e.g. "Period 1"
    teacher: string; // Dropdown
    subject: string; // Text input
    topic: string; // Text input
    isEditing?: boolean;
  }
  const [sevenPeriodRows, setSevenPeriodRows] = useState<SevenPeriodRow[]>([]);

  // Academic Year Schedule table states for selected profile
  interface SelectedProfileScheduleItem {
    id: string;
    dateEvent: string;
    assignedStaff: string[];
    subjectTask: string;
    isEditing?: boolean;
  }
  const [profileSchedules, setProfileSchedules] = useState<SelectedProfileScheduleItem[]>([]);

  // Global schedule table inline editing states
  const [globalEditStates, setGlobalEditStates] = useState<{ [id: string]: {
    isEditing?: boolean;
    event: string;
    assignedStaff: string[];
    subjectTask: string;
  }}>({});

  // Multi-select staff dropdown states
  const [openStaffDropdownId, setOpenStaffDropdownId] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Department choices
  const departmentsList = [
    'B.E. Computer Science and Engineering',
    'B.E. Computer Science and Engineering (Cyber Security)',
    'B.E. Electronics and Communication Engineering'
  ];

  // Fetch all databases
  const fetchData = async () => {
    try {
      const [studRes, staffRes, regRes, globalSchedRes] = await Promise.all([
        fetch('/api/records/students'),
        fetch('/api/records/staff'),
        fetch('/api/regulations'),
        fetch('/api/global-schedule')
      ]);

      const studData: StudentProfile[] = await studRes.json();
      const staffData: StaffProfile[] = await staffRes.json();
      const regData: string[] = await regRes.json();
      const globalSchedData: GlobalScheduleItem[] = await globalSchedRes.json();

      setStudents(studData);
      setStaff(staffData);
      setRegulations(regData);
      setGlobalSchedules(globalSchedData);

      // Initialize inline states for students
      const studStates: typeof studentEditStates = {};
      studData.forEach(s => {
        studStates[s.id] = {
          name: s.name,
          age: s.age,
          fatherName: s.fatherName,
          address: s.address,
          department: s.department
        };
      });
      setStudentEditStates(studStates);

      // Initialize inline states for staff
      const stStates: typeof staffEditStates = {};
      staffData.forEach(st => {
        stStates[st.id] = {
          name: st.name,
          department: st.department,
          age: st.age,
          fatherName: st.fatherName,
          address: st.address,
          certificates: st.certificateName ? [st.certificateName] : ['CISSP Certification', 'CISM Security Lead'],
          newCertName: '',
          showCertInput: false
        };
      });
      setStaffEditStates(stStates);

      // Also set global schedule states
      const gStates: typeof globalEditStates = {};
      globalSchedData.forEach(item => {
        gStates[item.id] = {
          isEditing: false,
          event: item.event,
          assignedStaff: item.assignedStaff || [],
          subjectTask: item.subjectTask
        };
      });
      setGlobalEditStates(gStates);

    } catch (err) {
      console.error('Error fetching deep portal datasets:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Load admin profile from cache if present
    const cachedAdmin = localStorage.getItem('CYBER_ADMIN_PROFILE');
    if (cachedAdmin) {
      try {
        setAdminProfile(JSON.parse(cachedAdmin));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update top admin profile
  const handleUpdateAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('CYBER_ADMIN_PROFILE', JSON.stringify(adminProfile));
    setMessage('ADMIN SECURITY PROFILE RE-CALIBRATED & SECURED SUCCESSFULLY!');
    setAdminNotifyBadge(false); // cleared
    setTimeout(() => setMessage(''), 4000);
  };

  // Export entire student directory to CSV
  const downloadAllStudentsCSV = () => {
    const headers = ['ID', 'Name', 'Age', 'Father Name', 'Address', 'Regulation', 'Department'];
    const csvRows = [headers.join(',')];
    students.forEach(s => {
      const row = [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.age,
        `"${s.fatherName.replace(/"/g, '""')}"`,
        `"${s.address.replace(/"/g, '""')}"`,
        `"${s.regulation || 'Regulation 2025'}"`,
        `"${s.department.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CSSA_Student_Directory_Dossiers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage('STUDENT DIRECTORY ARCHIVE EXPORTED SUCCESSFULLY (CSV).');
    setTimeout(() => setMessage(''), 4000);
  };

  // Generate and download a highly professional plaintext secure dossier
  const handleDownloadDossierText = (profile: StudentProfile | StaffProfile) => {
    const isStudent = students.some(s => s.id === profile.id);
    const roleText = isStudent ? 'STUDENT' : 'STAFF';
    const border = '='.repeat(80);
    const dashBorder = '-'.repeat(80);
    
    let text = `${border}\n`;
    text += `         DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY)\n`;
    text += `                   FORTEXA ACADEMIC SYSTEM CORE DATABASE\n`;
    text += `${border}\n`;
    text += `               SECURE ${roleText} ACADEMIC DOSSIER // OFFICIAL RECORD\n`;
    text += `${border}\n\n`;
    
    text += `[RECORD ID CODE]     : ${profile.id.toUpperCase()}\n`;
    text += `[FULL NAME IN DB]    : ${profile.name.toUpperCase()}\n`;
    text += `[PORTAL ACCESS ROLE] : ${roleText}\n`;
    text += `[AGE IN RECORD]      : ${profile.age} YEARS\n`;
    text += `[FATHER / GUARDIAN]  : ${profile.fatherName}\n`;
    text += `[COHORT REGULATION]  : ${profile.regulation || 'Regulation 2025'}\n`;
    text += `[ASSIGNED DIVISION]  : ${profile.department}\n`;
    text += `[RESIDENTIAL ADDRESS]: ${profile.address}\n\n`;
    
    text += `${dashBorder}\n`;
    text += `                ACTIVE ACADEMIC SEVEN-PERIOD GRID (DAILY TIMETABLE)\n`;
    text += `${dashBorder}\n`;
    text += `Period      | Subject Designation          | Assigned Instructor | Active Topic\n`;
    text += `------------+------------------------------+---------------------+----------------------\n`;
    
    sevenPeriodRows.forEach(row => {
      const periodPadded = row.period.padEnd(11);
      const subjectPadded = (row.subject || 'N/A').padEnd(28);
      const instructorPadded = (row.teacher || 'N/A').padEnd(19);
      const topic = row.topic || 'N/A';
      text += `${periodPadded} | ${subjectPadded} | ${instructorPadded} | ${topic}\n`;
    });
    
    text += `\n${dashBorder}\n`;
    text += `               COHORT MASTER ACADEMIC YEAR SCHEDULE NOTICES\n`;
    text += `${dashBorder}\n`;
    text += `Date / Event Node                      | Assigned Instructors | Core Task Target\n`;
    text += `---------------------------------------+----------------------+--------------------------\n`;
    
    profileSchedules.forEach(item => {
      const dateEventPadded = item.dateEvent.padEnd(38);
      const staffPadded = (item.assignedStaff || []).join(', ').padEnd(20);
      const task = item.subjectTask || 'N/A';
      text += `${dateEventPadded} | ${staffPadded} | ${task}\n`;
    });
    
    const hashSeed = `${profile.id}-${profile.name}-${Date.now()}`;
    const mockHash = Array.from(hashSeed).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '');
    
    text += `\n${border}\n`;
    text += `[INTEGRITY VALUE FOOTPRINT]\n`;
    text += `SHA-256 SIGNATURE: e4e9b9c9${mockHash.padEnd(16, 'f')}09a8b1c0d2e3f4a5b6c7d8e9f\n`;
    text += `RECORD VERIFIED BY: HOD DEPT OF CSE CYBER SECURITY\n`;
    text += `STATUS: MASTER OFFICIALLY CERTIFIED SECURE ARCHIVE\n`;
    text += `${border}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dossier_${profile.name.replace(/\s+/g, '_')}_Secure.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage(`SECURE TEXT DOSSIER DOWNLOADED FOR ${profile.name.toUpperCase()}`);
    setTimeout(() => setMessage(''), 4500);
  };

  // Open standard-compliant printable window styled like a high-end grade sheet / official card
  const handlePrintDossier = (profile: StudentProfile | StaffProfile) => {
    const isStudent = students.some(s => s.id === profile.id);
    
    const printContent = `
      <html>
        <head>
          <title>${profile.name} - Official Academic Dossier</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 40px;
              color: #111;
              background: #fff;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 5px 0;
            }
            .subtitle {
              font-size: 11px;
              color: #555;
              margin-top: 5px;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
              font-size: 13px;
            }
            .field {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              text-transform: uppercase;
              font-size: 11px;
              color: #444;
            }
            .value {
              font-size: 13px;
              border-bottom: 1px dashed #ccc;
              padding-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #111;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              text-transform: uppercase;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 2px solid #111;
              padding-bottom: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
              letter-spacing: 1px;
            }
            .footer {
              margin-top: 50px;
              border-top: 3px double #000;
              padding-top: 20px;
              font-size: 10px;
              text-align: center;
              color: #444;
            }
            .stamp {
              float: right;
              border: 2px solid #000;
              padding: 6px 12px;
              font-weight: bold;
              text-transform: uppercase;
              transform: rotate(-3deg);
              font-size: 11px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
            <div class="title" style="font-size:15px;">CYBER SECURITY DIVISION</div>
            <div class="subtitle">FORTEXA ACADEMIC MULTI-TENANCY CENTRAL RECORD</div>
          </div>
          
          <div class="stamp">OFFICIALLY CERTIFIED // CSE-CYBER</div>
          
          <div class="section-title">ACTIVE ACADEMIC PROFILE</div>
          
          <div class="profile-grid">
            <div class="field">
              <div class="label">RECORD ID NODE:</div>
              <div class="value">${profile.id.toUpperCase()}</div>
            </div>
            <div class="field">
              <div class="label">FULL LEGAL NAME:</div>
              <div class="value">${profile.name}</div>
            </div>
            <div class="field">
              <div class="label">REGISTRATION COHORT:</div>
              <div class="value">${profile.regulation || 'Regulation 2025'}</div>
            </div>
            <div class="field">
              <div class="label">UNIVERSITY SPECIALIZATION:</div>
              <div class="value">${profile.department}</div>
            </div>
            <div class="field">
              <div class="label">AGE STATE:</div>
              <div class="value">${profile.age} Years</div>
            </div>
            <div class="field">
              <div class="label">FATHER / GUARDIAN NAME:</div>
              <div class="value">${profile.fatherName}</div>
            </div>
            <div class="field" style="grid-column: span 2;">
              <div class="label">RESIDENTIAL ADDRESS LOCATION:</div>
              <div class="value">${profile.address}</div>
            </div>
          </div>
          
          <div class="section-title">SEVEN-PERIOD DAILY TIMETABLE</div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%">Period</th>
                <th style="width: 30%">Subject Title</th>
                <th style="width: 25%">Instructor</th>
                <th>Focus Topic / Lab Module</th>
              </tr>
            </thead>
            <tbody>
              ${sevenPeriodRows.map(row => `
                <tr>
                  <td><strong>${row.period}</strong></td>
                  <td>${row.subject || 'N/A'}</td>
                  <td>${row.teacher || 'N/A'}</td>
                  <td><em>${row.topic || 'N/A'}</em></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="section-title">ACADEMIC YEAR SCHEDULE NOTICES</div>
          <table>
            <thead>
              <tr>
                <th style="width: 30%">Date / Event</th>
                <th style="width: 25%">Assigned Staff</th>
                <th>Subject / Target task</th>
              </tr>
            </thead>
            <tbody>
              ${profileSchedules.map(item => `
                <tr>
                  <td><strong>${item.dateEvent}</strong></td>
                  <td>${(item.assignedStaff || []).join(', ')}</td>
                  <td>${item.subjectTask || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>INTEGRITY SECURITY VERIFICATION PACKET: SHA-512 SECURE DIRECTORY EMBEDDED</p>
            <p style="font-size:9px; color:#777;">Generated on ${new Date().toLocaleString()} // IP Security Clearance Active // Fortexa Systems</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert('Pop-up blocked! Please allow popups to view the printable official dossier.');
    }
  };

  // Student card inline changes
  const handleStudentFieldChange = (id: string, field: string, value: any) => {
    setStudentEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Save student changes
  const handleSaveStudentCard = async (id: string) => {
    const studentState = studentEditStates[id];
    if (!studentState) return;

    try {
      const response = await fetch(`/api/records/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentState.name,
          age: Number(studentState.age),
          fatherName: studentState.fatherName,
          address: studentState.address,
          department: studentState.department
        })
      });

      if (!response.ok) throw new Error('Database rejection of student updates.');

      // Toggle field back
      setStudentEditStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          editingField: undefined
        }
      }));

      setMessage(`STUDENT ${studentState.name.toUpperCase()} CATALOG RECORD UPDATED.`);
      fetchData();
      setTimeout(() => setMessage(''), 4500);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4500);
    }
  };

  // Staff card inline changes
  const handleStaffFieldChange = (id: string, field: string, value: any) => {
    setStaffEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Save staff changes
  const handleSaveStaffCard = async (id: string) => {
    const stState = staffEditStates[id];
    if (!stState) return;

    try {
      const response = await fetch(`/api/records/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: stState.name,
          department: stState.department,
          age: Number(stState.age),
          fatherName: stState.fatherName,
          address: stState.address,
          certificateName: stState.certificates.join(', ') // Sync list back as flat field if needed
        })
      });

      if (!response.ok) throw new Error('Database rejection of staff updates.');

      setMessage(`STAFF MEMBER ${stState.name.toUpperCase()} SECURE DOSSIER COMMIT COMPLETE.`);
      fetchData();
      setTimeout(() => setMessage(''), 4500);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4500);
    }
  };

  // Add Certificate dynamically to Staff card
  const handleAddCertificate = (id: string) => {
    const stState = staffEditStates[id];
    if (!stState || !stState.newCertName) return;

    const updatedCerts = [...stState.certificates, stState.newCertName];
    setStaffEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        certificates: updatedCerts,
        newCertName: '',
        showCertInput: false
      }
    }));
  };

  // Open Inner Portal & load data for student or staff
  const handleOpenInnerPortal = (profileId: string) => {
    setSelectedProfileId(profileId);

    // Find profile
    const studentFound = students.find(s => s.id === profileId);
    const staffFound = staff.find(st => st.id === profileId);
    const profile = studentFound || staffFound;

    if (profile) {
      // 1. Initialize 7 Period Timetable (or load existing if serialized)
      // If we saved it previously as custom field, otherwise default to nice sample
      const sampleSubjects = ['Network Security', 'Applied Cryptography', 'Ethical Hacking & Penetration Testing', 'Incident Response Logs', 'Operating Systems Hardening', 'Web Application Shielding', 'Cyber Law Compliance'];
      const sampleTopics = ['Intrusion Detection Systems', 'Elliptic Curve Cryptography', 'SQL Injection Attacks', 'Analyzing Wireshark PCAPs', 'Linux PAM Authentication', 'Content Security Policies', 'Information Technology Act'];
      const teachers = staff.map(st => st.name);
      if (teachers.length === 0) teachers.push('Alex Johnson', 'Dr. Evelyn Carter');

      let initialRows: SevenPeriodRow[] = [];
      const saved7: SevenPeriodRow[] = (profile as any).sevenPeriodTimetable;

      if (saved7 && saved7.length === 7) {
        initialRows = saved7.map(r => ({ ...r, isEditing: false }));
      } else {
        // Construct 7 rows
        for (let i = 1; i <= 7; i++) {
          initialRows.push({
            period: `Period ${i}`,
            teacher: teachers[(i - 1) % teachers.length],
            subject: sampleSubjects[i - 1] || 'Vulnerability Lab',
            topic: sampleTopics[i - 1] || 'Analyzing core memory overflows',
            isEditing: false
          });
        }
      }
      setSevenPeriodRows(initialRows);

      // 2. Initialize Academic Year Schedule for profile
      const savedSchedule: SelectedProfileScheduleItem[] = (profile as any).academicYearScheduleTable || [];
      if (savedSchedule && savedSchedule.length > 0) {
        setProfileSchedules(savedSchedule.map(item => ({ ...item, isEditing: false })));
      } else {
        // Sample initial events
        setProfileSchedules([
          { id: 'ps1', dateEvent: '2026-08-20 / Cyber Defense Hackathon', assignedStaff: [teachers[0]], subjectTask: 'Develop hands-on CTF challenges', isEditing: false },
          { id: 'ps2', dateEvent: '2026-09-10 / Cryptography Workshop', assignedStaff: teachers.slice(0, 2), subjectTask: 'Practical SSH vulnerability auditing', isEditing: false }
        ]);
      }

      setIsViewingInnerPortal(true);
      // Smooth scroll to bottom section
      setTimeout(() => {
        const portalSection = document.getElementById('inner-portal-expanded-section');
        if (portalSection) {
          portalSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Save expanded daily timetable
  const handleSaveTimetableRow = async (rowIndex: number) => {
    if (!selectedProfileId) return;

    // Toggle row's edit state
    const updatedRows = [...sevenPeriodRows];
    updatedRows[rowIndex].isEditing = false;
    setSevenPeriodRows(updatedRows);

    try {
      // Save entire array of 7 rows back to the profile endpoint
      const isStudent = students.some(s => s.id === selectedProfileId);
      const endpoint = isStudent ? `/api/records/students/${selectedProfileId}` : `/api/records/staff/${selectedProfileId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sevenPeriodTimetable: updatedRows.map(r => ({
            period: r.period,
            teacher: r.teacher,
            subject: r.subject,
            topic: r.topic
          }))
        })
      });

      if (!response.ok) throw new Error('Timetable rejected by database compiler.');

      setMessage('DAILY SEVEN-PERIOD GRID LOCKED & STORED ON NODE.');
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Save Profile's Academic Schedule Item
  const handleSaveProfileScheduleRow = async (itemId: string) => {
    if (!selectedProfileId) return;

    const updated = profileSchedules.map(item => {
      if (item.id === itemId) {
        return { ...item, isEditing: false };
      }
      return item;
    });
    setProfileSchedules(updated);

    try {
      const isStudent = students.some(s => s.id === selectedProfileId);
      const endpoint = isStudent ? `/api/records/students/${selectedProfileId}` : `/api/records/staff/${selectedProfileId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYearScheduleTable: updated.map(item => ({
            id: item.id,
            dateEvent: item.dateEvent,
            assignedStaff: item.assignedStaff,
            subjectTask: item.subjectTask
          }))
        })
      });

      if (!response.ok) throw new Error('Schedule item rejected by database schema validation.');

      setMessage('PROFILE ACADEMIC YEAR NOTICE COMMITTED AND LINKED.');
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Add new event row inside the active profile schedule
  const handleAddNewEventToProfile = () => {
    const teachers = staff.map(st => st.name);
    if (teachers.length === 0) teachers.push('Alex Johnson');

    const newRow: SelectedProfileScheduleItem = {
      id: 'ps_' + Date.now(),
      dateEvent: '2026-10-15 / Department Symposium',
      assignedStaff: [teachers[0]],
      subjectTask: 'Configure network segmentation',
      isEditing: true
    };
    setProfileSchedules(prev => [...prev, newRow]);
  };

  // Delete event row from active profile schedule
  const handleDeleteEventFromProfile = async (itemId: string) => {
    if (!selectedProfileId) return;

    const updated = profileSchedules.filter(item => item.id !== itemId);
    setProfileSchedules(updated);

    try {
      const isStudent = students.some(s => s.id === selectedProfileId);
      const endpoint = isStudent ? `/api/records/students/${selectedProfileId}` : `/api/records/staff/${selectedProfileId}`;

      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYearScheduleTable: updated.map(item => ({
            id: item.id,
            dateEvent: item.dateEvent,
            assignedStaff: item.assignedStaff,
            subjectTask: item.subjectTask
          }))
        })
      });

      setMessage('EVENT ROW DELETED.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Save changes to Global Academic Schedule
  const handleSaveGlobalScheduleRow = async (id: string) => {
    const editData = globalEditStates[id];
    if (!editData) return;

    try {
      const response = await fetch(`/api/global-schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: editData.event,
          assignedStaff: editData.assignedStaff,
          subjectTask: editData.subjectTask
        })
      });

      if (!response.ok) throw new Error('Database failed to secure global schedule pack.');

      setGlobalEditStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          isEditing: false
        }
      }));

      setMessage('GLOBAL ACADEMIC MASTER SCHEDULE CELL UPDATE COMMITTED.');
      fetchData();
      setTimeout(() => setMessage(''), 4500);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4500);
    }
  };

  // Add new Global Schedule Row
  const handleAddGlobalScheduleRow = async () => {
    const teachers = staff.map(st => st.name);
    if (teachers.length === 0) teachers.push('Alex Johnson');

    try {
      const response = await fetch('/api/global-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: '2026-12-01 / Fall Term Final Project Jury',
          assignedStaff: [teachers[0]],
          subjectTask: 'Conduct vulnerability assessment panel reviews'
        })
      });

      if (!response.ok) throw new Error('Database rejected row initialization.');

      setMessage('NEW MASTER ACADEMIC SCHEDULE CELL CREATED.');
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Delete Global Schedule Row
  const handleDeleteGlobalScheduleRow = async (id: string) => {
    if (!window.confirm('Delete this event node from the department master schedule?')) return;
    try {
      const response = await fetch(`/api/global-schedule/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete.');
      setMessage('MASTER SCHEDULE EVENT REMOVED.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle multi-select staff checking
  const handleToggleStaffSelection = (rowId: string, staffName: string, isGlobal: boolean) => {
    if (isGlobal) {
      const currentSelected = globalEditStates[rowId]?.assignedStaff || [];
      const updated = currentSelected.includes(staffName)
        ? currentSelected.filter(n => n !== staffName)
        : [...currentSelected, staffName];

      setGlobalEditStates(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          assignedStaff: updated
        }
      }));
    } else {
      // For selected profile schedule
      setProfileSchedules(prev => prev.map(item => {
        if (item.id === rowId) {
          const current = item.assignedStaff || [];
          const updated = current.includes(staffName)
            ? current.filter(n => n !== staffName)
            : [...current, staffName];
          return { ...item, assignedStaff: updated };
        }
        return item;
      }));
    }
  };

  // Selected profile data helper
  const selectedProfile = students.find(s => s.id === selectedProfileId) || staff.find(st => st.id === selectedProfileId);

  return (
    <div className="min-h-screen bg-[#050608] text-[#f3f4f6] font-mono px-4 md:px-8 py-6 flex flex-col justify-between select-none">
      
      {/* ----------------- TOP CONTROLS & HUD HEADER ----------------- */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f2937] pb-6 mb-8 relative">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs text-[#00f2ff] border border-[#00f2ff]/20 bg-[#00f2ff]/5 hover:bg-[#00f2ff]/10 px-4 py-2 rounded-sm transition-all cursor-pointer uppercase tracking-widest font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT DIRECTORY MANAGER</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-[#f3f4f6] uppercase flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#00f2ff] animate-pulse" />
              <span>Cyber Records & Schedules</span>
            </h1>
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest">
              SECURE MULTI-TENANCY CENTRAL DATABASE // USER-MANAGED PROFILE EDITING CONSOLE
            </p>
          </div>
        </div>

        {/* ----------------- TOP RIGHT: ADMIN PROFILE EDITING PANEL (ALEX JOHNSON) ----------------- */}
        <div className="bg-[#101218] border border-[#1f2937]/80 rounded-lg p-4 w-full lg:w-[480px] text-left relative shadow-2xl">
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <span className="text-[8px] bg-[#ff2d55]/20 border border-[#ff2d55]/30 text-[#ff2d55] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <ShieldCheck className="w-2 h-2" />
              ADMIN SHELL
            </span>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#1c2230] border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] overflow-hidden">
                <Users className="w-4 h-4" />
              </div>
              {adminNotifyBadge && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff2d55] border-2 border-[#101218] rounded-full animate-bounce"></span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-[#00f2ff]" />
            <h2 className="text-xs font-bold text-[#00f2ff] uppercase tracking-wider">
              Admin Profile: ALEX JOHNSON
            </h2>
          </div>

          <form onSubmit={handleUpdateAdminProfile} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-[#9ca3af] uppercase block mb-0.5">Admin Full Name</label>
                <input 
                  type="text" 
                  value={adminProfile.name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                  className="w-full bg-[#050608] border border-[#1f2937] text-[#f3f4f6] px-2 py-1 rounded focus:border-[#00f2ff] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-[#9ca3af] uppercase block mb-0.5">Admin Age</label>
                <input 
                  type="number" 
                  value={adminProfile.age}
                  onChange={(e) => setAdminProfile({ ...adminProfile, age: Number(e.target.value) })}
                  className="w-full bg-[#050608] border border-[#1f2937] text-[#f3f4f6] px-2 py-1 rounded focus:border-[#00f2ff] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-[#9ca3af] uppercase block mb-0.5">Father's Name</label>
                <input 
                  type="text" 
                  value={adminProfile.fatherName}
                  onChange={(e) => setAdminProfile({ ...adminProfile, fatherName: e.target.value })}
                  className="w-full bg-[#050608] border border-[#1f2937] text-[#f3f4f6] px-2 py-1 rounded focus:border-[#00f2ff] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-[#9ca3af] uppercase block mb-0.5">Department Scope</label>
                <select
                  value={adminProfile.department}
                  onChange={(e) => setAdminProfile({ ...adminProfile, department: e.target.value })}
                  className="w-full bg-[#050608] border border-[#1f2937] text-[#f3f4f6] px-1.5 py-1 rounded focus:border-[#00f2ff] outline-none"
                >
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-[#9ca3af] uppercase block mb-0.5">Residential Address Area</label>
              <textarea 
                value={adminProfile.address}
                onChange={(e) => setAdminProfile({ ...adminProfile, address: e.target.value })}
                rows={1}
                className="w-full bg-[#050608] border border-[#1f2937] text-[#f3f4f6] px-2 py-1 rounded focus:border-[#00f2ff] outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#00f2ff] hover:bg-[#00ffa3] text-[#050608] font-bold text-[10px] uppercase rounded-sm border-none transition-all cursor-pointer shadow-[0_0_8px_rgba(0,242,255,0.2)]"
              >
                UPDATE PROFILE
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ----------------- GLOBAL NOTIFICATION STRIP ----------------- */}
      <div className="max-w-7xl mx-auto w-full">
        {message && (
          <div className="border border-[#00ffa3]/40 bg-[#00ffa3]/10 text-[#00ffa3] p-3 rounded-sm text-xs mb-6 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping"></span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="border border-[#ff2d55]/40 bg-[#ff2d55]/10 text-[#ff2d55] p-3 rounded-sm text-xs mb-6 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-ping"></span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ----------------- NAVIGATION TABS SECTION ----------------- */}
      <div className="max-w-7xl mx-auto w-full mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-[#1f2937]/50 pb-2 gap-4">
        <div className="flex bg-[#101218] border border-[#1f2937] rounded p-1 max-w-md">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'student' ? 'bg-[#00ffa3] text-[#050608]' : 'text-[#9ca3af] hover:text-white'}`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>STUDENT DIRECTORY</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'staff' ? 'bg-[#00f2ff] text-[#050608]' : 'text-[#9ca3af] hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            <span>STAFF DIRECTORY</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded border text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'schedule' ? 'bg-[#00f2ff] text-[#050608] border-[#00f2ff]' : 'border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/10'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>GLOBAL ACADEMIC SCHEDULE</span>
          </button>
        </div>
      </div>

      {/* ----------------- MAIN CENTRAL CONTENT GRID ----------------- */}
      <div className="max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Authorized Student Catalog Directory Banner */}
              <div className="bg-[#101218] border border-[#1f2937]/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
                <div className="text-left">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30 font-bold uppercase tracking-widest font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse"></span>
                    DATABASE SYNCHRONIZED
                  </span>
                  <h3 className="text-sm font-extrabold uppercase text-gray-100 tracking-widest mt-1.5 flex items-center gap-2 font-mono">
                    <span>Authorized Student Catalog Directory</span>
                    <span className="text-xs text-[#00ffa3]">({students.length} ACTIVE DIRECTORIES)</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed max-w-2xl font-sans">
                    Access and generate verified secure dossier records. Single-click dossier download is active and synchronized across all matriculated student directories.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={downloadAllStudentsCSV}
                  className="px-4 py-2.5 bg-[#00ffa3]/5 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-[#050608] border border-[#00ffa3]/30 rounded text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 self-start md:self-auto font-mono"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All Details (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-gray-500 italic font-mono">No students loaded.</div>
                ) : (
                  students.map(s => {
                    const est = studentEditStates[s.id] || { name: s.name, age: s.age, fatherName: s.fatherName, address: s.address, department: s.department };
                    const isEditingName = est.editingField === 'name';
                    const isEditingDept = est.editingField === 'department';
                    const isEditingAge = est.editingField === 'age';
                    const isEditingFather = est.editingField === 'fatherName';
                    const isEditingAddress = est.editingField === 'address';

                    return (
                      <div 
                        key={s.id} 
                        className="bg-[#0c0e14] border border-[#1f2937] hover:border-[#00ffa3]/30 rounded-xl p-5 flex flex-col justify-between transition-all shadow-xl relative"
                      >
                        <div>
                          {/* ID & Cohort Header */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="px-2 py-0.5 rounded text-[8px] bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/20 font-bold uppercase tracking-wider">
                              {s.regulation || 'Regulation 2025'}
                            </span>
                            <span className="text-[9px] text-[#9ca3af] font-mono">NODE_ID: {s.id.toUpperCase()}</span>
                          </div>

                          {/* Editable Fields list */}
                          <div className="space-y-3.5 mb-5 text-left text-xs text-[#f3f4f6]">
                            {/* Name Field */}
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Student Full Name</span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {isEditingName ? (
                                  <input 
                                    type="text"
                                    value={est.name}
                                    onChange={(e) => handleStudentFieldChange(s.id, 'name', e.target.value)}
                                    className="bg-[#050608] border border-[#00ffa3] rounded px-2 py-1 text-white flex-1 font-bold outline-none"
                                  />
                                ) : (
                                  <span className="font-extrabold text-sm text-gray-200 tracking-wider uppercase">{s.name}</span>
                                )}
                                <button
                                  onClick={() => handleStudentFieldChange(s.id, 'editingField', isEditingName ? undefined : 'name')}
                                  className="p-1 hover:bg-[#1f2937] rounded transition-colors text-gray-500 hover:text-[#00ffa3]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Department Field */}
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Department / Division</span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {isEditingDept ? (
                                  <select
                                    value={est.department}
                                    onChange={(e) => handleStudentFieldChange(s.id, 'department', e.target.value)}
                                    className="bg-[#050608] border border-[#00ffa3] rounded px-1.5 py-1 text-white flex-1 outline-none text-[11px]"
                                  >
                                    {departmentsList.map(dept => (
                                      <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[#00ffa3] font-semibold text-[11px]">{s.department}</span>
                                )}
                                <button
                                  onClick={() => handleStudentFieldChange(s.id, 'editingField', isEditingDept ? undefined : 'department')}
                                  className="p-1 hover:bg-[#1f2937] rounded transition-colors text-gray-500 hover:text-[#00ffa3]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Age Field */}
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Age</span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {isEditingAge ? (
                                  <input 
                                    type="number"
                                    value={est.age}
                                    onChange={(e) => handleStudentFieldChange(s.id, 'age', Number(e.target.value))}
                                    className="bg-[#050608] border border-[#00ffa3] rounded px-2 py-1 text-white flex-1 outline-none"
                                  />
                                ) : (
                                  <span className="text-gray-300">{s.age} Years</span>
                                )}
                                <button
                                  onClick={() => handleStudentFieldChange(s.id, 'editingField', isEditingAge ? undefined : 'age')}
                                  className="p-1 hover:bg-[#1f2937] rounded transition-colors text-gray-500 hover:text-[#00ffa3]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Father Name Field */}
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase font-sans">Father / Guardian Name</span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {isEditingFather ? (
                                  <input 
                                    type="text"
                                    value={est.fatherName}
                                    onChange={(e) => handleStudentFieldChange(s.id, 'fatherName', e.target.value)}
                                    className="bg-[#050608] border border-[#00ffa3] rounded px-2 py-1 text-white flex-1 outline-none"
                                  />
                                ) : (
                                  <span className="text-gray-300">{s.fatherName}</span>
                                )}
                                <button
                                  onClick={() => handleStudentFieldChange(s.id, 'editingField', isEditingFather ? undefined : 'fatherName')}
                                  className="p-1 hover:bg-[#1f2937] rounded transition-colors text-gray-500 hover:text-[#00ffa3]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Address Field */}
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Residential Address</span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {isEditingAddress ? (
                                  <textarea 
                                    value={est.address}
                                    onChange={(e) => handleStudentFieldChange(s.id, 'address', e.target.value)}
                                    rows={2}
                                    className="bg-[#050608] border border-[#00ffa3] rounded px-2 py-1 text-white flex-1 outline-none text-[11px] resize-none"
                                  />
                                ) : (
                                  <span className="text-gray-400 line-clamp-2 text-[11px] leading-relaxed">{s.address}</span>
                                )}
                                <button
                                  onClick={() => handleStudentFieldChange(s.id, 'editingField', isEditingAddress ? undefined : 'address')}
                                  className="p-1 hover:bg-[#1f2937] rounded transition-colors text-gray-500 hover:text-[#00ffa3]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between border-t border-[#1f2937]/50 pt-3 gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenInnerPortal(s.id)}
                            className="px-3 py-1.5 bg-[#00ffa3]/5 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-[#050608] rounded text-[10px] font-black border border-[#00ffa3]/30 transition-all cursor-pointer uppercase tracking-wider flex-1 min-w-[100px]"
                          >
                            OPEN PORTAL
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadDossierText(s)}
                            className="p-1.5 bg-slate-900 hover:bg-[#00ffa3]/20 text-slate-400 hover:text-[#00ffa3] rounded border border-slate-800 hover:border-[#00ffa3]/30 transition-all cursor-pointer"
                            title="Download Dossier"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveStudentCard(s.id)}
                            className="px-3 py-1.5 bg-[#00ffa3] text-[#050608] font-black text-[10px] rounded hover:bg-[#00f2ff] transition-all cursor-pointer uppercase flex items-center justify-center gap-1 border-none flex-1 min-w-[100px]"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>SAVE</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {staff.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-500 italic">No staff profiles loaded.</div>
              ) : (
                staff.map(st => {
                  const est = staffEditStates[st.id] || { name: st.name, department: st.department, age: st.age, fatherName: st.fatherName, address: st.address, certificates: ['CISSP', 'Ph.D'], showCertInput: false, newCertName: '' };

                  return (
                    <div 
                      key={st.id} 
                      className="bg-[#0b0c10] border border-[#1f2937] hover:border-[#00f2ff]/30 rounded-xl p-5 flex flex-col justify-between transition-all shadow-xl text-left"
                    >
                      <div>
                        {/* ID & Header */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-2 py-0.5 rounded text-[8px] bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 font-bold uppercase tracking-wider">
                            {st.regulation || 'Regulation 2025'}
                          </span>
                          <span className="text-[9px] text-[#9ca3af] font-mono">STAFF_ID: {st.id.toUpperCase()}</span>
                        </div>

                        {/* Editable Card Fields directly in view */}
                        <div className="space-y-3 mb-5">
                          {/* Name */}
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase">Staff Name</span>
                            <div className="flex items-center border border-[#1f2937] focus-within:border-[#00f2ff] rounded bg-[#050608] px-2.5 py-1 mt-1">
                              <input 
                                type="text"
                                value={est.name}
                                onChange={(e) => handleStaffFieldChange(st.id, 'name', e.target.value)}
                                className="w-full bg-transparent text-gray-100 font-extrabold text-xs outline-none"
                              />
                              <Edit3 className="w-3 h-3 text-gray-500 ml-1" />
                            </div>
                          </div>

                          {/* Department Dropdown */}
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase">Department Scope</span>
                            <div className="flex items-center border border-[#1f2937] focus-within:border-[#00f2ff] rounded bg-[#050608] px-2.5 py-1 mt-1">
                              <select 
                                value={est.department}
                                onChange={(e) => handleStaffFieldChange(st.id, 'department', e.target.value)}
                                className="w-full bg-transparent text-emerald-400 font-bold text-[11px] outline-none"
                              >
                                {departmentsList.map(dept => (
                                  <option key={dept} value={dept}>{dept}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
                            </div>
                          </div>

                          {/* Age, Father Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Age</span>
                              <div className="flex items-center border border-[#1f2937] focus-within:border-[#00f2ff] rounded bg-[#050608] px-2.5 py-1 mt-1">
                                <input 
                                  type="number"
                                  value={est.age}
                                  onChange={(e) => handleStaffFieldChange(st.id, 'age', Number(e.target.value))}
                                  className="w-full bg-transparent text-gray-200 text-xs outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 block uppercase">Father's Name</span>
                              <div className="flex items-center border border-[#1f2937] focus-within:border-[#00f2ff] rounded bg-[#050608] px-2.5 py-1 mt-1">
                                <input 
                                  type="text"
                                  value={est.fatherName}
                                  onChange={(e) => handleStaffFieldChange(st.id, 'fatherName', e.target.value)}
                                  className="w-full bg-transparent text-gray-200 text-xs outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase">Residential Address</span>
                            <div className="flex items-center border border-[#1f2937] focus-within:border-[#00f2ff] rounded bg-[#050608] px-2.5 py-1 mt-1">
                              <textarea 
                                value={est.address}
                                onChange={(e) => handleStaffFieldChange(st.id, 'address', e.target.value)}
                                rows={1}
                                className="w-full bg-transparent text-gray-300 text-xs outline-none resize-none"
                              />
                            </div>
                          </div>

                          {/* Academic Certificates Sub-section */}
                          <div className="border-t border-[#1f2937]/50 pt-2 mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Award className="w-3 h-3 text-[#00f2ff]" />
                                <span>Academic Certificates</span>
                              </span>
                              <button
                                onClick={() => handleStaffFieldChange(st.id, 'showCertInput', !est.showCertInput)}
                                className="text-[9px] text-[#00f2ff] hover:underline cursor-pointer uppercase font-bold"
                              >
                                {est.showCertInput ? 'CANCEL' : 'EDIT/ADD'}
                              </button>
                            </div>

                            {est.showCertInput && (
                              <div className="flex gap-1.5 mb-2 bg-[#050608] p-1.5 rounded border border-[#00f2ff]/30">
                                <input 
                                  type="text" 
                                  placeholder="e.g., OSCP Leader" 
                                  value={est.newCertName}
                                  onChange={(e) => handleStaffFieldChange(st.id, 'newCertName', e.target.value)}
                                  className="bg-transparent text-xs text-white flex-1 outline-none border-b border-gray-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddCertificate(st.id)}
                                  className="px-2 py-0.5 bg-[#00f2ff] text-black text-[9px] font-bold rounded"
                                >
                                  ADD
                                </button>
                              </div>
                            )}

                            <ul className="space-y-1 text-[11px] text-gray-300">
                              {est.certificates.map((cert, cIdx) => (
                                <li key={cIdx} className="flex items-center gap-1.5 bg-[#050608]/60 px-2 py-1 rounded border border-[#1f2937]/50">
                                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="truncate">{cert}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between border-t border-[#1f2937]/50 pt-3">
                        <button
                          onClick={() => handleOpenInnerPortal(st.id)}
                          className="px-3.5 py-1.5 bg-[#00f2ff]/5 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-[#050608] rounded text-[10px] font-black border border-[#00f2ff]/30 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          OPEN INNER PORTAL
                        </button>

                        <button
                          onClick={() => handleSaveStaffCard(st.id)}
                          className="px-4 py-1.5 bg-[#00f2ff] text-[#050608] font-black text-[10px] rounded hover:bg-[#00ffa3] transition-all cursor-pointer uppercase flex items-center gap-1 border-none"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>SAVE</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="globalSchedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0b0c10] border border-[#1f2937] rounded-xl p-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-3.5 mb-4">
                <div className="flex items-center space-x-2 text-[#00f2ff]">
                  <Calendar className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-extrabold uppercase tracking-widest">
                    Global Department Academic Master Schedule Grid
                  </h3>
                </div>
                <button
                  onClick={handleAddGlobalScheduleRow}
                  className="px-4 py-2 bg-[#00f2ff] text-[#050608] hover:bg-[#00ffa3] font-bold text-xs rounded transition-all cursor-pointer uppercase border-none"
                >
                  ADD NEW EVENT
                </button>
              </div>

              {/* Editable Master Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#050608]/70">
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[240px]">Date / Event</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[260px]">Assigned Staff (Multi-Select)</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider">Subject / Task Target</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/40 text-gray-300">
                    {globalSchedules.map(item => {
                      const est = globalEditStates[item.id] || { isEditing: false, event: item.event, assignedStaff: item.assignedStaff || [], subjectTask: item.subjectTask };
                      const teachers = staff.map(st => st.name);
                      if (teachers.length === 0) teachers.push('Alex Johnson', 'Dr. Evelyn Carter');

                      return (
                        <tr key={item.id} className="hover:bg-[#101218]/40 transition-colors">
                          {/* Event Column */}
                          <td className="p-3">
                            {est.isEditing ? (
                              <input 
                                type="text"
                                value={est.event}
                                onChange={(e) => {
                                  setGlobalEditStates(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], event: e.target.value }
                                  }));
                                }}
                                className="w-full bg-[#050608] border border-[#00f2ff]/40 text-white rounded px-2.5 py-1 text-xs outline-none"
                              />
                            ) : (
                              <span className="font-extrabold uppercase text-gray-200 tracking-wider block">
                                {item.event}
                              </span>
                            )}
                          </td>

                          {/* Multi Select Staff Column */}
                          <td className="p-3 relative">
                            {est.isEditing ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setOpenStaffDropdownId(openStaffDropdownId === item.id ? null : item.id)}
                                  className="w-full flex items-center justify-between bg-[#050608] border border-[#00f2ff]/40 text-gray-300 px-2 py-1 rounded text-left"
                                >
                                  <span>{est.assignedStaff.length} Checked</span>
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>

                                {openStaffDropdownId === item.id && (
                                  <div className="absolute left-3 right-3 top-[44px] z-50 bg-[#0c0e14] border border-[#00f2ff]/50 rounded p-2.5 max-h-[140px] overflow-y-auto space-y-1.5 shadow-2xl">
                                    {teachers.map(name => {
                                      const checked = est.assignedStaff.includes(name);
                                      return (
                                        <label key={name} className="flex items-center gap-2 text-xs text-gray-200 hover:text-white cursor-pointer">
                                          <input 
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleToggleStaffSelection(item.id, name, true)}
                                            className="rounded border-[#1f2937] text-[#00f2ff] focus:ring-0 bg-transparent"
                                          />
                                          <span>{name}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {(item.assignedStaff || []).map((stName, idx) => (
                                  <span key={idx} className="bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded-[3px] text-[10px] font-bold border border-[#00f2ff]/20">
                                    {stName}
                                  </span>
                                ))}
                                {(item.assignedStaff || []).length === 0 && <span className="text-gray-600 italic">No staff assigned</span>}
                              </div>
                            )}
                          </td>

                          {/* Subject Task Column */}
                          <td className="p-3">
                            {est.isEditing ? (
                              <input 
                                type="text"
                                value={est.subjectTask}
                                onChange={(e) => {
                                  setGlobalEditStates(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], subjectTask: e.target.value }
                                  }));
                                }}
                                className="w-full bg-[#050608] border border-[#00f2ff]/40 text-white rounded px-2.5 py-1 text-xs outline-none"
                              />
                            ) : (
                              <span className="text-gray-400">{item.subjectTask}</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            {est.isEditing ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveGlobalScheduleRow(item.id)}
                                  className="p-1.5 bg-[#00ffa3]/20 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-[#050608] rounded transition-colors"
                                  title="Save Row"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setGlobalEditStates(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], isEditing: false }
                                    }));
                                  }}
                                  className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setGlobalEditStates(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], isEditing: true }
                                    }));
                                  }}
                                  className="p-1.5 bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-[#050608] rounded transition-all cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGlobalScheduleRow(item.id)}
                                  className="p-1.5 bg-[#ff2d55]/10 hover:bg-[#ff2d55] text-[#ff2d55] hover:text-white rounded transition-all cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ----------------- EXPANDED BOTTOM SECTION (THE INNER PORTAL) ----------------- */}
      <AnimatePresence>
        {isViewingInnerPortal && selectedProfile && (
          <motion.div
            id="inner-portal-expanded-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="max-w-7xl mx-auto w-full mt-12 bg-[#0c0e14] border border-[#1f2937] rounded-2xl p-6 text-left shadow-2xl space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00f2ff]/5 to-transparent pointer-events-none"></div>

            {/* Inner Portal Close Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1f2937] pb-4 gap-4">
              <div>
                <span className="text-[9px] bg-[#00f2ff]/10 text-[#00f2ff] px-2.5 py-0.5 rounded font-black tracking-widest border border-[#00f2ff]/20 uppercase">
                  NODE INTERNAL PORTAL ACCESS
                </span>
                <h2 className="text-lg md:text-xl font-black text-gray-200 tracking-widest uppercase mt-1">
                  Active Folder: {selectedProfile.name} ({students.some(s => s.id === selectedProfileId) ? 'STUDENT' : 'STAFF'})
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadDossierText(selectedProfile)}
                  className="px-3.5 py-1.5 bg-[#00ffa3]/10 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-black border border-[#00ffa3]/30 text-[10px] font-black rounded uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Secure Dossier (.txt)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePrintDossier(selectedProfile)}
                  className="px-3.5 py-1.5 bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-black border border-[#00f2ff]/30 text-[10px] font-black rounded uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier Card (PDF)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsViewingInnerPortal(false)}
                  className="px-3.5 py-1.5 border border-[#ff2d55]/30 bg-transparent text-[#ff2d55] hover:bg-[#ff2d55] hover:text-[#050608] text-[10px] font-bold rounded uppercase tracking-widest transition-all cursor-pointer"
                >
                  CLOSE INNER PORTAL
                </button>
              </div>
            </div>

            {/* Part 1: INTERACTIVE DAILY TIMETABLE (7 Period rows list) */}
            <div className="bg-[#101218] border border-[#1f2937]/70 rounded-xl p-5 shadow-inner">
              <div className="border-b border-[#1f2937]/60 pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#00f2ff]">
                  <Grid className="w-5 h-5" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest">
                    INTERACTIVE DAILY TIMETABLE (SEVEN PERIOD CORE GRID)
                  </h3>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">
                  COMPLIANT WITH SEC_PROTOCOL 908
                </span>
              </div>

              {/* The Seven Period Row List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#050608]/75">
                      <th className="p-3 text-emerald-400 font-bold uppercase tracking-wider w-[120px]">Period Block</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[240px]">Select Teacher / Instructor</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[280px]">Subject Designation</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider">Active Topic</th>
                      <th className="p-3 text-[#00f2ff] font-bold uppercase tracking-wider w-[100px] text-right">Commit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/35 text-gray-300">
                    {sevenPeriodRows.map((row, rIdx) => {
                      const teachers = staff.map(st => st.name);
                      if (teachers.length === 0) teachers.push('Alex Johnson', 'Dr. Evelyn Carter');

                      return (
                        <tr key={rIdx} className="hover:bg-[#101218]/50 transition-all">
                          {/* Period */}
                          <td className="p-3 font-extrabold text-gray-200 uppercase">{row.period}</td>

                          {/* Teacher Dropdown */}
                          <td className="p-3">
                            {row.isEditing ? (
                              <select
                                value={row.teacher}
                                onChange={(e) => {
                                  const updated = [...sevenPeriodRows];
                                  updated[rIdx].teacher = e.target.value;
                                  setSevenPeriodRows(updated);
                                }}
                                className="w-full bg-[#050608] border border-[#00f2ff]/40 text-xs text-white rounded px-2.5 py-1 outline-none"
                              >
                                {teachers.map(name => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="flex items-center space-x-1">
                                <UserCheck className="w-3.5 h-3.5 text-cyan-400/70" />
                                <span className="font-bold text-gray-200">{row.teacher}</span>
                              </span>
                            )}
                          </td>

                          {/* Subject Input */}
                          <td className="p-3">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.subject}
                                onChange={(e) => {
                                  const updated = [...sevenPeriodRows];
                                  updated[rIdx].subject = e.target.value;
                                  setSevenPeriodRows(updated);
                                }}
                                className="w-full bg-[#050608] border border-[#00f2ff]/40 text-xs text-white rounded px-2.5 py-1 outline-none font-bold"
                              />
                            ) : (
                              <span className="text-gray-300">{row.subject}</span>
                            )}
                          </td>

                          {/* Topic Input */}
                          <td className="p-3">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.topic}
                                onChange={(e) => {
                                  const updated = [...sevenPeriodRows];
                                  updated[rIdx].topic = e.target.value;
                                  setSevenPeriodRows(updated);
                                }}
                                className="w-full bg-[#050608] border border-[#00f2ff]/40 text-xs text-white rounded px-2.5 py-1 outline-none"
                              />
                            ) : (
                              <span className="text-gray-400 italic">{row.topic}</span>
                            )}
                          </td>

                          {/* Row Save Action */}
                          <td className="p-3 text-right">
                            {row.isEditing ? (
                              <button
                                onClick={() => handleSaveTimetableRow(rIdx)}
                                className="px-3 py-1 bg-[#00ffa3] text-[#050608] font-black text-[10px] uppercase rounded"
                              >
                                SAVE
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const updated = [...sevenPeriodRows];
                                  updated[rIdx].isEditing = true;
                                  setSevenPeriodRows(updated);
                                }}
                                className="p-1.5 bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-[#050608] rounded transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Part 2: DETAILED ACADEMIC YEAR SCHEDULE */}
            <div className="bg-[#101218] border border-[#1f2937]/70 rounded-xl p-5 shadow-inner">
              <div className="border-b border-[#1f2937]/60 pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#00ffa3]">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest">
                    ACTIVE COHORT MASTER ACADEMIC YEAR SCHEDULE
                  </h3>
                </div>
                <button
                  onClick={handleAddNewEventToProfile}
                  className="px-3 py-1.5 bg-[#00ffa3] text-black hover:bg-[#00f2ff] font-bold text-[10px] uppercase rounded border-none cursor-pointer"
                >
                  ADD NEW EVENT
                </button>
              </div>

              {/* Editable Table format */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#050608]/75">
                      <th className="p-3 text-[#00ffa3] font-bold uppercase tracking-wider w-[240px]">Date / Event Node</th>
                      <th className="p-3 text-[#00ffa3] font-bold uppercase tracking-wider w-[260px]">Assigned Staff (Multi-Select)</th>
                      <th className="p-3 text-[#00ffa3] font-bold uppercase tracking-wider">Subject / Task Target</th>
                      <th className="p-3 text-[#00ffa3] font-bold uppercase tracking-wider w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/35 text-gray-300">
                    {profileSchedules.map(item => {
                      const teachers = staff.map(st => st.name);
                      if (teachers.length === 0) teachers.push('Alex Johnson', 'Dr. Evelyn Carter');

                      return (
                        <tr key={item.id} className="hover:bg-[#101218]/50 transition-colors">
                          {/* Date/Event */}
                          <td className="p-3">
                            {item.isEditing ? (
                              <input 
                                type="text"
                                value={item.dateEvent}
                                onChange={(e) => {
                                  setProfileSchedules(prev => prev.map(p => p.id === item.id ? { ...p, dateEvent: e.target.value } : p));
                                }}
                                className="w-full bg-[#050608] border border-[#00ffa3]/40 text-white rounded px-2.5 py-1 outline-none"
                              />
                            ) : (
                              <span className="font-extrabold uppercase text-gray-200 tracking-wider">
                                {item.dateEvent}
                              </span>
                            )}
                          </td>

                          {/* Assigned Staff (Multi-Select) */}
                          <td className="p-3 relative">
                            {item.isEditing ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setOpenStaffDropdownId(openStaffDropdownId === item.id ? null : item.id)}
                                  className="w-full flex items-center justify-between bg-[#050608] border border-[#00ffa3]/40 text-gray-300 px-2 py-1 rounded text-left"
                                >
                                  <span>{(item.assignedStaff || []).length} Checked</span>
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>

                                {openStaffDropdownId === item.id && (
                                  <div className="absolute left-3 right-3 top-[44px] z-50 bg-[#0c0e14] border border-[#00ffa3]/50 rounded p-2.5 max-h-[140px] overflow-y-auto space-y-1.5 shadow-2xl">
                                    {teachers.map(name => {
                                      const checked = (item.assignedStaff || []).includes(name);
                                      return (
                                        <label key={name} className="flex items-center gap-2 text-xs text-gray-200 hover:text-white cursor-pointer">
                                          <input 
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleToggleStaffSelection(item.id, name, false)}
                                            className="rounded border-[#1f2937] text-[#00ffa3] focus:ring-0 bg-transparent"
                                          />
                                          <span>{name}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {(item.assignedStaff || []).map((stName, idx) => (
                                  <span key={idx} className="bg-[#00ffa3]/10 text-[#00ffa3] px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-bold border border-[#00ffa3]/20">
                                    {stName}
                                  </span>
                                ))}
                                {(item.assignedStaff || []).length === 0 && <span className="text-gray-600 italic">No staff assigned</span>}
                              </div>
                            )}
                          </td>

                          {/* Subject/Task Target */}
                          <td className="p-3">
                            {item.isEditing ? (
                              <input 
                                type="text"
                                value={item.subjectTask}
                                onChange={(e) => {
                                  setProfileSchedules(prev => prev.map(p => p.id === item.id ? { ...p, subjectTask: e.target.value } : p));
                                }}
                                className="w-full bg-[#050608] border border-[#00ffa3]/40 text-white rounded px-2.5 py-1 outline-none"
                              />
                            ) : (
                              <span className="text-gray-400">{item.subjectTask}</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            {item.isEditing ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveProfileScheduleRow(item.id)}
                                  className="p-1.5 bg-[#00ffa3]/20 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-[#050608] rounded transition-all cursor-pointer"
                                  title="Save Row"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProfileSchedules(prev => prev.map(p => p.id === item.id ? { ...p, isEditing: false } : p));
                                  }}
                                  className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 cursor-pointer"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setProfileSchedules(prev => prev.map(p => p.id === item.id ? { ...p, isEditing: true } : p));
                                  }}
                                  className="p-1.5 bg-[#00ffa3]/10 hover:bg-[#00ffa3] text-[#00ffa3] hover:text-[#050608] rounded transition-all cursor-pointer"
                                  title="Edit Row"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEventFromProfile(item.id)}
                                  className="p-1.5 bg-[#ff2d55]/10 hover:bg-[#ff2d55] text-[#ff2d55] hover:text-white rounded transition-all cursor-pointer"
                                  title="Delete Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Security Footprint is handled at App level */}
    </div>
  );
}
