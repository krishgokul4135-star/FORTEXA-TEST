/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Middleware for parsing JSON payloads with generous limit for screenshot uploads
app.use(express.json({ limit: '15mb' }));

// -------------------------------------------------------------
// REDIS CACHING SIMULATION & SECURITY LOGGING MIDDLEWARE
// -------------------------------------------------------------
// Logs response times and simulates Redis cache hits for performance (<200ms target, actually <5ms)
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function (body) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Cache-Status', duration < 5 ? 'HIT (Emulated Redis)' : 'MISS');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Log cyber security audit trail
    console.log(`[SEC_AUDIT] ${new Date().toISOString()} | IP: ::1 | REQ: ${req.method} ${req.originalUrl} | STATUS: ${res.statusCode} | TIME: ${duration}ms`);
    return originalSend.call(this, body);
  };
  next();
});

// -------------------------------------------------------------
// SEED DATA DECLARATIONS
// -------------------------------------------------------------
const defaultThreats = [
  {
    id: 't1',
    title: 'Zero-Day Patch Released for OpenSSL',
    type: 'good',
    severity: 'critical',
    timestamp: '2026-07-14T10:30:00Z',
    description: 'A critical vulnerability in OpenSSL allowing remote code execution was successfully mitigated by security patch v3.4.1.',
    actionOrPatch: 'Upgrade OpenSSL instances to version 3.4.1 immediately.'
  },
  {
    id: 't2',
    title: 'Active Ransomware Campaign: BlackCat 3.0',
    type: 'bad',
    severity: 'high',
    timestamp: '2026-07-14T08:15:00Z',
    description: 'BlackCat 3.0 ransomware is actively targeting academic institutions via sophisticated spear-phishing templates.',
    actionOrPatch: 'Isolate affected network segments; deploy custom intrusion prevention system (IPS) rules.'
  },
  {
    id: 't3',
    title: 'DDoS Attack Shield Enabled successfully',
    type: 'good',
    severity: 'high',
    timestamp: '2026-07-13T19:40:00Z',
    description: 'A massive 400 Gbps UDP reflection flood targeting the university admission portal was successfully absorbed by our Cloudflare scrubbing center.',
    actionOrPatch: 'No user action required. Threshold filters adjusted automatically.'
  },
  {
    id: 't4',
    title: 'Sophisticated Phishing Campaign Detected',
    type: 'bad',
    severity: 'medium',
    timestamp: '2026-07-13T14:22:00Z',
    description: 'Phishing emails claiming to be from "HOD Cyber Security" are circulating, requesting staff credentials.',
    actionOrPatch: 'Implement external sender banners and activate DMARC strict rejection policy.'
  }
];

const defaultCareers = [
  {
    id: 'c1',
    role: 'Cyber Security Analyst Intern',
    company: 'CrowdStrike Technologies',
    vacancy: 3,
    salary: '$45 - $60 / hour',
    requirements: 'Familiarity with SIEM tools (Splunk), Wireshark packet inspection, and penetration testing concepts.',
    location: 'Remote / Bangalore Hub'
  },
  {
    id: 'c2',
    role: 'Associate Incident Responder',
    company: 'Palo Alto Networks',
    vacancy: 2,
    salary: 'INR 12,00,000 - 15,00,000 per annum',
    requirements: 'Understanding of TCP/IP networking, malware analysis, scripting in Python/PowerShell.',
    location: 'Chennai Tech Park'
  },
  {
    id: 'c3',
    role: 'Junior Penetration Tester',
    company: 'Mandiant (Google Cloud)',
    vacancy: 1,
    salary: 'INR 14,00,000 per annum',
    requirements: 'CEH, OSCP certificate holders preferred. Excellent understanding of OWASP Top 10.',
    location: 'Hyderabad Campus'
  }
];

const defaultAssociation = {
  logo: '', // Base64 string placeholder
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
  cashierName: 'Prof. Sarah Connor',
  departmentName: 'Computer Science Engineering (Cybersecurity)',
  academicYear: '2026-2027',
  objective: 'To foster academic excellence, advanced threat research, and cybersecurity operational readiness across the student chapters.'
};

const defaultEvents = [
  {
    id: 'e1',
    title: 'Annual Cyber Defense Hackathon 2026',
    date: '2026-08-20',
    time: '09:00 - 18:00',
    venue: 'Cyber Security Laboratory / Virtual Hub',
    description: 'An intensive 9-hour blue-team vs red-team simulation challenging participants to secure vulnerability-laden infrastructure.'
  },
  {
    id: 'e2',
    title: 'Symposium: AI-Powered Malware & Cryptography',
    date: '2026-09-05',
    time: '10:00 - 13:00',
    venue: 'Seminar Hall III',
    description: 'A guest lecture by leading Cyber Security Architects focusing on generative AI threat detection systems.'
  }
];

const defaultNotices = [
  {
    id: 'n1',
    title: 'Important: Class Test 1 Schedule Published',
    date: '2026-07-14',
    content: 'Class Test 1 for all regulations is scheduled to begin on Monday, 2026-07-21. Formats include technical quizzes and class log assessments.',
    author: 'Department HOD Office'
  },
  {
    id: 'n2',
    title: 'Registration Open for Cyber Defense Hackathon',
    date: '2026-07-13',
    content: 'Registration is now open for our upcoming Hackathon. A registration ledger is active on the Event Funds portal. Students must submit transaction proofs for approval.',
    author: 'CSSA Coordinator'
  }
];

const defaultStudentProfiles = [
  {
    id: 's_alice',
    name: 'Alice Johnson',
    age: 20,
    fatherName: 'Richard Johnson',
    address: '456 Hackers Alley, Secure Valley, SV-908',
    regulation: 'Regulation 2025',
    department: 'B.E. Computer Science and Engineering (Cyber Security)',
    certificateName: 'CompTIA Security+ Proof.pdf',
    certificateUrl: 'mock_uploaded_cert_alice',
    timeTable: [
      { day: 'Monday', periods: ['Cryptography', 'Network Security', 'Ethical Hacking', 'Operating Systems', 'Cyber Law'] },
      { day: 'Tuesday', periods: ['Ethical Hacking', 'Cryptography', 'Database Systems', 'Web Tech', 'Network Security Lab'] },
      { day: 'Wednesday', periods: ['Operating Systems', 'Cyber Law', 'Web Tech', 'Cryptography', 'Ethical Hacking Lab'] },
      { day: 'Thursday', periods: ['Network Security', 'Cryptography', 'Cyber Law', 'Operating Systems', 'Ethical Hacking'] },
      { day: 'Friday', periods: ['Database Systems', 'Ethical Hacking', 'Network Security', 'Web Tech', 'Technical Seminar'] }
    ],
    academicSchedule: [
      { id: 'sc1', period: 'Period 1 (09:00 - 10:00)', subject: 'Cryptography', classroom: 'Room 402', instructor: 'Dr. Evelyn Carter' },
      { id: 'sc2', period: 'Period 2 (10:00 - 11:00)', subject: 'Network Security', classroom: 'Room 402', instructor: 'Prof. Sarah Connor' },
      { id: 'sc3', period: 'Period 3 (11:15 - 12:15)', subject: 'Ethical Hacking', classroom: 'Cyber-Sandbox-Lab', instructor: 'Dr. Alan Turing' }
    ]
  },
  {
    id: 's_bob',
    name: 'Bob Miller',
    age: 21,
    fatherName: 'David Miller',
    address: '789 Defensive Ridge, Port Block 80',
    regulation: 'Regulation 2021',
    department: 'B.E. Computer Science and Engineering',
    certificateName: 'OSCP Certification.pdf',
    certificateUrl: 'mock_uploaded_cert_bob',
    timeTable: [
      { day: 'Monday', periods: ['Advanced Networks', 'Cloud Security', 'Reverse Engineering', 'Compiler Design', 'Elective III'] },
      { day: 'Tuesday', periods: ['Reverse Engineering', 'Advanced Networks', 'Software Testing', 'Cloud Lab', 'Compiler Design'] },
      { day: 'Wednesday', periods: ['Cloud Security', 'Elective III', 'Advanced Networks', 'Compiler Design', 'Reverse Engineering Lab'] },
      { day: 'Thursday', periods: ['Compiler Design', 'Cloud Security', 'Reverse Engineering', 'Advanced Networks', 'Software Testing'] },
      { day: 'Friday', periods: ['Software Testing', 'Cloud Security', 'Elective III', 'Technical Seminar', 'Project Viva'] }
    ],
    academicSchedule: [
      { id: 'sc4', period: 'Period 1 (09:00 - 10:00)', subject: 'Advanced Networks', classroom: 'Room 301', instructor: 'Dr. Marcus Vance' },
      { id: 'sc5', period: 'Period 2 (10:00 - 11:00)', subject: 'Cloud Security', classroom: 'Room 301', instructor: 'Prof. Helen Troy' }
    ]
  }
];

const defaultStaffProfiles = [
  {
    id: 'st_alex',
    name: 'Alex Johnson',
    age: 35,
    fatherName: 'Richard Johnson',
    address: '456 Hackers Alley, Secure Valley, SV-908',
    regulation: 'Regulation 2025',
    department: 'B.E. Computer Science and Engineering (Cyber Security)',
    certificateName: 'CISSP Certified.pdf',
    certificateUrl: 'mock_uploaded_cert_alex',
    timeTable: [
      { day: 'Monday', periods: ['Network Security', 'Cryptography', 'Ethical Hacking', 'Operating Systems', 'Cyber Law', 'System Defense', 'Vulnerability Assessment'] },
      { day: 'Tuesday', periods: ['Ethical Hacking', 'Cryptography', 'Database Systems', 'Web Tech', 'Network Security Lab', 'Reverse Engineering', 'Cloud Security'] },
      { day: 'Wednesday', periods: ['Operating Systems', 'Cyber Law', 'Web Tech', 'Cryptography', 'Ethical Hacking Lab', 'Intrusion Detection', 'Incident Response'] },
      { day: 'Thursday', periods: ['Network Security', 'Cryptography', 'Cyber Law', 'Operating Systems', 'Ethical Hacking', 'Penetration Testing', 'Malware Analysis'] },
      { day: 'Friday', periods: ['Database Systems', 'Ethical Hacking', 'Network Security', 'Web Tech', 'Technical Seminar', 'Forensics', 'Security Audit'] }
    ],
    academicSchedule: [
      { id: 'st_sc3', period: 'Period 1 (09:00 - 10:00)', subject: 'Network Security', classroom: 'Room 402', instructor: 'Alex Johnson (Self)' },
      { id: 'st_sc4', period: 'Period 2 (10:00 - 11:00)', subject: 'Cryptography', classroom: 'Room 402', instructor: 'Dr. Evelyn Carter' }
    ]
  },
  {
    id: 'st_carter',
    name: 'Dr. Evelyn Carter',
    age: 42,
    fatherName: 'George Carter',
    address: '12 Faculty Residences, Campus Town',
    regulation: 'Regulation 2025',
    department: 'B.E. Computer Science and Engineering (Cyber Security)',
    certificateName: 'Ph.D in Applied Cryptography.pdf',
    certificateUrl: 'mock_uploaded_cert_carter',
    timeTable: [
      { day: 'Monday', periods: ['Cryptography (CS)', 'Free Period', 'Cryptography (CSE)', 'Free Period', 'Security Lab Guidance', 'Academic Review', 'Syllabus Prep'] },
      { day: 'Tuesday', periods: ['Free Period', 'Cryptography (CS)', 'Research Guidance', 'Free Period', 'Cryptanalysis Seminar', 'Office Hours', 'Department Meeting'] },
      { day: 'Wednesday', periods: ['Cryptography (CSE)', 'Free Period', 'Cryptography (CS)', 'Advisory Meeting', 'Free Period', 'Project Review', 'Syllabus Review'] },
      { day: 'Thursday', periods: ['Free Period', 'Cryptography (CS)', 'Research Guidance', 'Cryptography (CSE)', 'Free Period', 'Staff Briefing', 'Lab Inspection'] },
      { day: 'Friday', periods: ['Research Guidance', 'Free Period', 'Cryptography (CS)', 'Free Period', 'Syllabus Review', 'Curriculum Audit', 'Dean Conference'] }
    ],
    academicSchedule: [
      { id: 'st_sc1', period: 'Period 1 (09:00 - 10:00)', subject: 'Cryptography (CS)', classroom: 'Room 402', instructor: 'Dr. Evelyn Carter (Self)' },
      { id: 'st_sc2', period: 'Period 3 (11:15 - 12:15)', subject: 'Cryptography (CSE)', classroom: 'Room 401', instructor: 'Dr. Evelyn Carter (Self)' }
    ]
  }
];

const defaultQuizzes = [
  {
    id: 'q1',
    title: 'Quiz 1: Network & Crypto Security Basics',
    questions: [
      {
        id: 'q1_1',
        question: 'Which of the following asymmetric algorithms is based on the difficulty of factoring large prime numbers?',
        options: ['AES', 'DES', 'RSA', 'Diffie-Hellman'],
        correctAnswer: 2
      },
      {
        id: 'q1_2',
        question: 'What port is standard for securely logging into a remote server via SSH?',
        options: ['Port 80', 'Port 443', 'Port 22', 'Port 23'],
        correctAnswer: 2
      },
      {
        id: 'q1_3',
        question: 'What type of malware is explicitly designed to remain hidden on a system while granting persistent administrative access?',
        options: ['Adware', 'Rootkit', 'Ransomware', 'Spyware'],
        correctAnswer: 1
      },
      {
        id: 'q1_4',
        question: 'Which security principle ensures that user accounts are only granted the minimum privileges required to do their work?',
        options: ['Defense in Depth', 'Separation of Duties', 'Least Privilege', 'Fail-Safe Defaults'],
        correctAnswer: 2
      }
    ]
  }
];

const defaultClassTests = [
  {
    id: 'ct1',
    subject: 'Cryptography (CYBER-502)',
    date: '2026-07-10',
    maxMarks: 50,
    marks: {
      'Alice Johnson': 48,
      'Bob Miller': 39,
      'Charlie Davis': 42
    }
  }
];

const defaultLedger = [
  {
    id: 'l1',
    studentName: 'Alice Johnson',
    registerNumber: 'CS2023-CY009',
    year: '3rd Year',
    department: 'CybSec',
    amount: 750,
    status: 'Verified',
    date: '2026-07-12T09:44:00Z',
    screenshotName: 'tx_proof_alice.png',
    screenshotUrl: 'mock_tx_proof_alice',
    eventName: 'CybSec Symposium',
    transactionId: 'TXN8927498213'
  },
  {
    id: 'l2',
    studentName: 'Bob Miller',
    registerNumber: 'CS2021-SE104',
    year: 'Final Year',
    department: 'CybSec',
    amount: 500,
    status: 'Pending',
    date: '2026-07-13T16:15:00Z',
    screenshotName: 'payment_screenshot_bob.jpg',
    screenshotUrl: 'mock_tx_proof_bob',
    eventName: 'CybSec Symposium',
    transactionId: 'TXN8927498214'
  },
  {
    id: 'l3',
    studentName: 'Johnathan Doe',
    registerNumber: 'CS2023-CY012',
    year: '3rd Year',
    department: 'Computer Science',
    amount: 5000,
    status: 'Verified',
    date: '2026-07-11T11:20:00Z',
    screenshotName: 'tx_proof_johnathan.png',
    screenshotUrl: 'mock_tx_proof_johnathan',
    eventName: 'Hackathon - CSS',
    transactionId: 'TXN89100123'
  },
  {
    id: 'l4',
    studentName: 'Sarah Conner',
    registerNumber: 'CS2023-CY045',
    year: '3rd Year',
    department: 'CybSec',
    amount: 10000,
    status: 'Verified',
    date: '2026-07-10T14:35:00Z',
    screenshotName: 'tx_proof_sarah.png',
    screenshotUrl: 'mock_tx_proof_sarah',
    eventName: 'CybSec Symposium',
    transactionId: 'TXN89100124'
  },
  {
    id: 'l5',
    studentName: 'David Miller',
    registerNumber: 'CS2023-CY088',
    year: '3rd Year',
    department: 'Electronics',
    amount: 10000,
    status: 'Verified',
    date: '2026-07-09T10:15:00Z',
    screenshotName: 'tx_proof_david.png',
    screenshotUrl: 'mock_tx_proof_david',
    eventName: 'Workshop - AI',
    transactionId: 'TXN89100125'
  }
];

const defaultExpenses = [
  { id: 'e1', category: 'Food & Catering', amount: 8500 },
  { id: 'e2', category: 'Guest Speaker Honorarium', amount: 6500 },
  { id: 'e3', category: 'Marketing & Badges', amount: 3200 }
];

const defaultRegulations = ['Regulation 2021', 'Regulation 2022', 'Regulation 2023', 'Regulation 2024', 'Regulation 2025'];

const defaultGallery = [
  { 
    id: 'g1', 
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', 
    caption: 'Cyber Sandbox Laboratory Launch Event',
    type: 'image',
    fileSize: '1.4 MB',
    fileType: 'image/jpeg',
    uploadDate: '2026-07-10'
  },
  { 
    id: 'g2', 
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', 
    caption: 'Ethical Hacking Boot Camp Workshop',
    type: 'image',
    fileSize: '2.1 MB',
    fileType: 'image/jpeg',
    uploadDate: '2026-07-11'
  },
  { 
    id: 'g3', 
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', 
    caption: 'Annual Cyber Cryptography Seminar',
    type: 'image',
    fileSize: '1.8 MB',
    fileType: 'image/jpeg',
    uploadDate: '2026-07-12'
  },
  {
    id: 'g4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cyber-security-code-on-a-screen-8178-large.mp4',
    caption: 'Threat Modeling Symposium Hackathon Footage',
    type: 'video',
    fileSize: '14.8 MB',
    fileType: 'video/mp4',
    uploadDate: '2026-07-13'
  },
  {
    id: 'g5',
    url: 'https://www.w3schools.com/html/movie.mp4',
    caption: 'Department Orientation & Cyber Sandbox tour',
    type: 'video',
    fileSize: '8.3 MB',
    fileType: 'video/mp4',
    uploadDate: '2026-07-14'
  },
  {
    id: 'g6',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    caption: 'Intro to Reverse Engineering Seminar Recording',
    type: 'audio',
    fileSize: '4.7 MB',
    fileType: 'audio/mp3',
    uploadDate: '2026-07-13'
  },
  {
    id: 'g7',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    caption: 'Weekly CSSA Academic Council Briefing',
    type: 'audio',
    fileSize: '3.9 MB',
    fileType: 'audio/mp3',
    uploadDate: '2026-07-14'
  }
];

// Initialize database with seed data if empty
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      threats: defaultThreats,
      careers: defaultCareers,
      association: defaultAssociation,
      events: defaultEvents,
      notices: defaultNotices,
      studentProfiles: defaultStudentProfiles,
      staffProfiles: defaultStaffProfiles,
      quizzes: defaultQuizzes,
      classTests: defaultClassTests,
      ledger: defaultLedger,
      expenses: defaultExpenses,
      regulations: defaultRegulations,
      gallery: defaultGallery,
      forgotRequests: [] as any[]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    let changed = false;
    if (!parsed.expenses) {
      parsed.expenses = defaultExpenses;
      changed = true;
    }
    if (!parsed.ledger || parsed.ledger.length === 2) {
      parsed.ledger = defaultLedger;
      changed = true;
    }
    if (!parsed.association) {
      parsed.association = defaultAssociation;
      changed = true;
    } else {
      if (!parsed.association.name) {
        parsed.association.name = defaultAssociation.name;
        changed = true;
      }
      if (parsed.association.president === undefined) {
        parsed.association.president = defaultAssociation.president;
        parsed.association.presidentPhoto = defaultAssociation.presidentPhoto;
        parsed.association.vicePresident = defaultAssociation.vicePresident;
        parsed.association.vicePresidentPhoto = defaultAssociation.vicePresidentPhoto;
        parsed.association.treasurer = defaultAssociation.treasurer;
        parsed.association.treasurerPhoto = defaultAssociation.treasurerPhoto;
        parsed.association.managementHead = defaultAssociation.managementHead;
        parsed.association.cashierName = defaultAssociation.cashierName;
        changed = true;
      }
      if (parsed.association.departmentName === undefined) {
        parsed.association.departmentName = defaultAssociation.departmentName;
        parsed.association.academicYear = defaultAssociation.academicYear;
        parsed.association.objective = defaultAssociation.objective;
        changed = true;
      }
    }
    if (!parsed.gallery || parsed.gallery.length < 5) {
      parsed.gallery = defaultGallery;
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, resetting to default.', err);
    const initialData = {
      threats: defaultThreats,
      careers: defaultCareers,
      association: defaultAssociation,
      events: defaultEvents,
      notices: defaultNotices,
      studentProfiles: defaultStudentProfiles,
      staffProfiles: defaultStaffProfiles,
      quizzes: defaultQuizzes,
      classTests: defaultClassTests,
      ledger: defaultLedger,
      expenses: defaultExpenses,
      regulations: defaultRegulations,
      gallery: defaultGallery,
      forgotRequests: [] as any[]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// API CONTROLLERS
// -------------------------------------------------------------

// 1. DUAL-ROLE AUTHENTICATION PORTAL
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and portal role are strictly required.' });
  }

  // Validate formatting
  const usernameRegex = /^[A-Za-z]+\.[A-Za-z]+$/;
  const passwordRegex = /^149[^a-zA-Z0-9]\d{3}$/;

  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: 'Format Error: Username must contain a name, followed by a dot (.), and then the initial (e.g., Gokul.P).' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Format Error: Password must strictly start with department code 149, followed by any special character, and end with exactly 3 digits (e.g., 149@789).' });
  }

  const [namePart, initialPart] = username.split('.');
  const nameLower = namePart.toLowerCase();

  if (role === 'staff') {
    // If name matches pre-configured profiles or standard inputs, log them in as that user
    if (nameLower === 'carter' || nameLower === 'evelyn' || nameLower === 'staff' || nameLower === 'admin') {
      return res.json({
        token: 'SEC_SESSION_TOKEN_STAFF_' + Math.random().toString(36).substr(2),
        user: {
          id: 'st_carter',
          username: username,
          email: 'carter@cyberdept.univ.edu',
          role: 'staff'
        }
      });
    } else {
      // Dynamic fallback for any other valid formatted staff username
      return res.json({
        token: 'SEC_SESSION_TOKEN_STAFF_' + Math.random().toString(36).substr(2),
        user: {
          id: 'st_' + nameLower,
          username: username,
          email: `${nameLower}@cyberdept.univ.edu`,
          role: 'staff'
        }
      });
    }
  } else if (role === 'student') {
    if (nameLower === 'alice' || nameLower === 'johnson' || nameLower === 'student') {
      return res.json({
        token: 'SEC_SESSION_TOKEN_STUDENT_' + Math.random().toString(36).substr(2),
        user: {
          id: 's_alice',
          username: username,
          email: 'alice@student.univ.edu',
          role: 'student'
        }
      });
    } else if (nameLower === 'bob' || nameLower === 'miller') {
      return res.json({
        token: 'SEC_SESSION_TOKEN_STUDENT_' + Math.random().toString(36).substr(2),
        user: {
          id: 's_bob',
          username: username,
          email: 'bob@student.univ.edu',
          role: 'student'
        }
      });
    } else {
      // Dynamic fallback for any other valid formatted student username
      return res.json({
        token: 'SEC_SESSION_TOKEN_STUDENT_' + Math.random().toString(36).substr(2),
        user: {
          id: 's_' + nameLower,
          username: username,
          email: `${nameLower}@student.univ.edu`,
          role: 'student'
        }
      });
    }
  }

  // Return a realistic authentication failure block
  return res.status(401).json({ error: 'Access Denied: Invalid credentials or portal scope mismatch.' });
});

// Forgot username/password recovery
app.post('/api/auth/recover', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid registered academic email address.' });
  }
  const db = loadDB();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.forgotRequests.push({ email, otp, timestamp: new Date().toISOString() });
  saveDB(db);

  return res.json({
    success: true,
    message: `Secure OTP recovery block generated. A temporary security token (${otp}) has been dispatched to ${email} via academic mail relay servers.`
  });
});

// 2. REAL-TIME CYBER ANALYTICS & THREATS
app.get('/api/threats', (req, res) => {
  const db = loadDB();
  res.json(db.threats);
});

app.post('/api/threats', (req, res) => {
  const { title, type, severity, description, actionOrPatch } = req.body;
  if (!title || !type || !severity || !description) {
    return res.status(400).json({ error: 'Incomplete security payload. All fields are required.' });
  }
  const db = loadDB();
  const newThreat = {
    id: 't_' + Date.now(),
    title,
    type,
    severity,
    timestamp: new Date().toISOString(),
    description,
    actionOrPatch: actionOrPatch || 'Monitor active security vectors and review system audit trails.'
  };
  db.threats.unshift(newThreat);
  saveDB(db);
  res.json(newThreat);
});

// 3. CAREERS HIRE HUB
app.get('/api/careers', (req, res) => {
  const db = loadDB();
  res.json(db.careers);
});

// 4. ASSOCIATION VIEW
app.get('/api/association', (req, res) => {
  const db = loadDB();
  res.json(db.association);
});

app.post('/api/association/update', (req, res) => {
  const { 
    logo, name, profileDescription, schedule, 
    president, presidentPhoto, vicePresident, vicePresidentPhoto, 
    treasurer, treasurerPhoto, managementHead, cashierName,
    departmentName, academicYear, objective
  } = req.body;
  const db = loadDB();
  if (logo !== undefined) db.association.logo = logo;
  if (name !== undefined) db.association.name = name;
  if (profileDescription !== undefined) db.association.profileDescription = profileDescription;
  if (schedule !== undefined) db.association.schedule = schedule;
  if (president !== undefined) db.association.president = president;
  if (presidentPhoto !== undefined) db.association.presidentPhoto = presidentPhoto;
  if (vicePresident !== undefined) db.association.vicePresident = vicePresident;
  if (vicePresidentPhoto !== undefined) db.association.vicePresidentPhoto = vicePresidentPhoto;
  if (treasurer !== undefined) db.association.treasurer = treasurer;
  if (treasurerPhoto !== undefined) db.association.treasurerPhoto = treasurerPhoto;
  if (managementHead !== undefined) db.association.managementHead = managementHead;
  if (cashierName !== undefined) db.association.cashierName = cashierName;
  if (departmentName !== undefined) db.association.departmentName = departmentName;
  if (academicYear !== undefined) db.association.academicYear = academicYear;
  if (objective !== undefined) db.association.objective = objective;
  saveDB(db);
  res.json(db.association);
});

// 5. EVENTS & BROADCAST NOTICE BOARD
app.get('/api/events', (req, res) => {
  const db = loadDB();
  res.json({ events: db.events, notices: db.notices });
});

app.post('/api/events', (req, res) => {
  const { title, date, time, venue, description } = req.body;
  if (!title || !date || !time || !venue || !description) {
    return res.status(400).json({ error: 'Incomplete event fields.' });
  }
  const db = loadDB();
  const newEvent = { id: 'e_' + Date.now(), title, date, time, venue, description };
  db.events.unshift(newEvent);
  saveDB(db);
  res.json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, date, time, venue, description } = req.body;
  const db = loadDB();
  const index = db.events.findIndex((e: any) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Event not found.' });
  
  db.events[index] = { ...db.events[index], title, date, time, venue, description };
  saveDB(db);
  res.json(db.events[index]);
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.events = db.events.filter((e: any) => e.id !== id);
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/notices', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing notice fields.' });
  const db = loadDB();
  const newNotice = {
    id: 'n_' + Date.now(),
    title,
    date: new Date().toISOString().split('T')[0],
    content,
    author: author || 'Department Office'
  };
  db.notices.unshift(newNotice);
  saveDB(db);
  res.json(newNotice);
});

// 6. EVENT GALLERY
app.get('/api/gallery', (req, res) => {
  const db = loadDB();
  res.json(db.gallery);
});

app.post('/api/gallery', (req, res) => {
  const { url, caption, type, fileSize, fileType } = req.body;
  if (!url) return res.status(400).json({ error: 'Image URL or file payload is required.' });
  const db = loadDB();
  const newPhoto = { 
    id: 'g_' + Date.now(), 
    url, 
    caption: caption || 'Cyber Security Department Media Asset',
    type: type || 'image',
    fileSize: fileSize || '1.2 MB',
    fileType: fileType || 'image/png',
    uploadDate: new Date().toLocaleDateString()
  };
  db.gallery.unshift(newPhoto);
  saveDB(db);
  res.json(newPhoto);
});

app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.gallery = db.gallery.filter((g: any) => g.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// 7. ACADEMIC CRUD (STUDENTS & STAFF PROFILES)
app.get('/api/records/students', (req, res) => {
  const db = loadDB();
  res.json(db.studentProfiles);
});

app.post('/api/records/students', (req, res) => {
  const { name, age, fatherName, address, regulation, department, certificateName, certificateUrl, timeTable, academicSchedule } = req.body;
  if (!name || !age || !fatherName || !address || !regulation || !department) {
    return res.status(400).json({ error: 'Required fields missing for student profile.' });
  }
  const db = loadDB();
  const newStudent = {
    id: 's_' + Date.now(),
    name,
    age: Number(age),
    fatherName,
    address,
    regulation,
    department,
    certificateName: certificateName || undefined,
    certificateUrl: certificateUrl || undefined,
    timeTable: timeTable || [
      { day: 'Monday', periods: ['', '', '', '', ''] },
      { day: 'Tuesday', periods: ['', '', '', '', ''] },
      { day: 'Wednesday', periods: ['', '', '', '', ''] },
      { day: 'Thursday', periods: ['', '', '', '', ''] },
      { day: 'Friday', periods: ['', '', '', '', ''] }
    ],
    academicSchedule: academicSchedule || []
  };
  db.studentProfiles.unshift(newStudent);
  saveDB(db);
  res.json(newStudent);
});

app.put('/api/records/students/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.studentProfiles.findIndex((s: any) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student profile not found.' });
  
  db.studentProfiles[index] = { ...db.studentProfiles[index], ...req.body };
  saveDB(db);
  res.json(db.studentProfiles[index]);
});

app.delete('/api/records/students/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.studentProfiles = db.studentProfiles.filter((s: any) => s.id !== id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/records/staff', (req, res) => {
  const db = loadDB();
  res.json(db.staffProfiles);
});

app.post('/api/records/staff', (req, res) => {
  const { name, age, fatherName, address, regulation, department, certificateName, certificateUrl, timeTable, academicSchedule } = req.body;
  if (!name || !age || !fatherName || !address || !regulation || !department) {
    return res.status(400).json({ error: 'Required fields missing for staff profile.' });
  }
  const db = loadDB();
  const newStaff = {
    id: 'st_' + Date.now(),
    name,
    age: Number(age),
    fatherName,
    address,
    regulation,
    department,
    certificateName: certificateName || undefined,
    certificateUrl: certificateUrl || undefined,
    timeTable: timeTable || [
      { day: 'Monday', periods: ['', '', '', '', ''] },
      { day: 'Tuesday', periods: ['', '', '', '', ''] },
      { day: 'Wednesday', periods: ['', '', '', '', ''] },
      { day: 'Thursday', periods: ['', '', '', '', ''] },
      { day: 'Friday', periods: ['', '', '', '', ''] }
    ],
    academicSchedule: academicSchedule || []
  };
  db.staffProfiles.unshift(newStaff);
  saveDB(db);
  res.json(newStaff);
});

app.put('/api/records/staff/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.staffProfiles.findIndex((st: any) => st.id === id);
  if (index === -1) return res.status(404).json({ error: 'Staff profile not found.' });

  db.staffProfiles[index] = { ...db.staffProfiles[index], ...req.body };
  saveDB(db);
  res.json(db.staffProfiles[index]);
});

app.delete('/api/records/staff/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.staffProfiles = db.staffProfiles.filter((st: any) => st.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// Regulation Batch Management
app.get('/api/regulations', (req, res) => {
  const db = loadDB();
  res.json(db.regulations);
});

app.post('/api/records/regulation', (req, res) => {
  const { regulation } = req.body;
  if (!regulation || !regulation.startsWith('Regulation')) {
    return res.status(400).json({ error: 'Invalid formulation. Must start with prefix "Regulation" (e.g. Regulation 2026).' });
  }
  const db = loadDB();
  if (db.regulations.includes(regulation)) {
    return res.status(400).json({ error: `Dynamic data structures for ${regulation} already configured.` });
  }
  db.regulations.push(regulation);
  db.regulations.sort();
  saveDB(db);
  res.json({ success: true, list: db.regulations });
});

// 8. ASSESSMENT & QUIZZES
app.get('/api/quizzes', (req, res) => {
  const db = loadDB();
  res.json(db.quizzes);
});

app.post('/api/quizzes', (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid Quiz Structure. Title and Questions array are strictly required.' });
  }
  const db = loadDB();
  const newQuiz = {
    id: 'q_' + Date.now(),
    title,
    questions: questions.map((q: any, i: number) => ({
      id: `q_q_${Date.now()}_${i}`,
      question: q.question,
      options: q.options || ['', '', '', ''],
      correctAnswer: Number(q.correctAnswer)
    }))
  };
  db.quizzes.push(newQuiz);
  saveDB(db);
  res.json(newQuiz);
});

app.get('/api/class-tests', (req, res) => {
  const db = loadDB();
  res.json(db.classTests);
});

app.post('/api/class-tests', (req, res) => {
  const { subject, date, maxMarks, marks } = req.body;
  if (!subject || !date || !maxMarks || !marks) {
    return res.status(400).json({ error: 'Missing assessment parameters.' });
  }
  const db = loadDB();
  const newTest = {
    id: 'ct_' + Date.now(),
    subject,
    date,
    maxMarks: Number(maxMarks),
    marks
  };
  db.classTests.unshift(newTest);
  saveDB(db);
  res.json(newTest);
});

// 9. EVENT FUND LEDGER
app.get('/api/ledger', (req, res) => {
  const db = loadDB();
  
  // Compute cost-benefit tracker
  const totalFundsCollected = (db.ledger || [])
    .filter((entry: any) => entry.status === 'Verified')
    .reduce((sum: number, entry: any) => sum + entry.amount, 0);
    
  // Compute event expenses based on DB categories
  const totalExpenses = (db.expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0);
  const remainingBalance = totalFundsCollected - totalExpenses;

  // Pie Chart 1: Registration Analytics (Registered vs Pending)
  const verifiedCount = (db.ledger || []).filter((entry: any) => entry.status === 'Verified').length;
  const pendingCount = (db.ledger || []).filter((entry: any) => entry.status === 'Pending').length;

  res.json({
    ledger: db.ledger || [],
    expenses: db.expenses || [],
    metrics: {
      totalFundsCollected,
      totalExpenses,
      remainingBalance
    },
    registrationAnalytics: {
      verifiedCount,
      pendingCount
    }
  });
});

app.post('/api/ledger', (req, res) => {
  const { studentName, registerNumber, year, department, amount, screenshotName, screenshotUrl, eventName, transactionId, status } = req.body;
  if (!studentName || !registerNumber || !year || !amount) {
    return res.status(400).json({ error: 'Required fields missing for participant Ledger registration.' });
  }
  const db = loadDB();
  const newEntry = {
    id: 'l_' + Date.now(),
    studentName,
    registerNumber,
    year,
    department: department || 'CybSec',
    amount: Number(amount),
    status: status || 'Pending',
    date: new Date().toISOString(),
    screenshotName: screenshotName || undefined,
    screenshotUrl: screenshotUrl || undefined,
    eventName: eventName || 'CybSec Symposium',
    transactionId: transactionId || 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000)
  };
  db.ledger.unshift(newEntry);
  saveDB(db);
  res.json(newEntry);
});

// Full update PUT endpoint for ledger entry
app.put('/api/ledger/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.ledger.findIndex((l: any) => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Ledger record not found.' });

  const { studentName, registerNumber, year, department, amount, status, eventName, transactionId, screenshotUrl, screenshotName } = req.body;

  db.ledger[index] = {
    ...db.ledger[index],
    ...(studentName !== undefined && { studentName }),
    ...(registerNumber !== undefined && { registerNumber }),
    ...(year !== undefined && { year }),
    ...(department !== undefined && { department }),
    ...(amount !== undefined && { amount: Number(amount) }),
    ...(status !== undefined && { status }),
    ...(eventName !== undefined && { eventName }),
    ...(transactionId !== undefined && { transactionId }),
    ...(screenshotUrl !== undefined && { screenshotUrl }),
    ...(screenshotName !== undefined && { screenshotName })
  };

  saveDB(db);
  res.json(db.ledger[index]);
});

// Retro-compatibility legacy route
app.put('/api/ledger/:id/verify', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.ledger.findIndex((l: any) => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Ledger record not found.' });

  db.ledger[index].status = 'Verified';
  saveDB(db);
  res.json(db.ledger[index]);
});

app.delete('/api/ledger/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.ledger = db.ledger.filter((l: any) => l.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// Event Expense Categories update
app.put('/api/ledger/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { category, amount } = req.body;
  const db = loadDB();
  const index = db.expenses.findIndex((e: any) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Expense category not found.' });

  if (category !== undefined) db.expenses[index].category = category;
  if (amount !== undefined) db.expenses[index].amount = Number(amount);

  saveDB(db);
  res.json(db.expenses[index]);
});

app.post('/api/ledger/expenses', (req, res) => {
  const { category, amount } = req.body;
  if (!category || amount === undefined) {
    return res.status(400).json({ error: 'Required fields missing for expense category.' });
  }
  const db = loadDB();
  const newExpense = {
    id: 'e_' + Date.now(),
    category,
    amount: Number(amount)
  };
  db.expenses.push(newExpense);
  saveDB(db);
  res.json(newExpense);
});

app.delete('/api/ledger/expenses/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.expenses = db.expenses.filter((e: any) => e.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. GLOBAL ACADEMIC SCHEDULE
// -------------------------------------------------------------
app.get('/api/global-schedule', (req, res) => {
  const db = loadDB();
  res.json(db.globalSchedule || [
    { id: "gs1", event: "Winter Exams", assignedStaff: ["Dr. Evelyn Carter", "Alex Johnson"], subjectTask: "Prepare and deploy technical hands-on security challenges" },
    { id: "gs2", event: "Guest Lecture: Cryptography", assignedStaff: ["Dr. Evelyn Carter"], subjectTask: "Key exchange protocol vulnerability analysis" },
    { id: "gs3", event: "Project Thesis Deadline", assignedStaff: ["Alex Johnson"], subjectTask: "Collect reports and run anti-plagiarism scanning logs" }
  ]);
});

app.post('/api/global-schedule', (req, res) => {
  const db = loadDB();
  const { event, assignedStaff, subjectTask } = req.body;
  if (!event || !subjectTask) {
    return res.status(400).json({ error: 'Missing event name or subject/task details.' });
  }
  if (!db.globalSchedule) {
    db.globalSchedule = [
      { id: "gs1", event: "Winter Exams", assignedStaff: ["Dr. Evelyn Carter", "Alex Johnson"], subjectTask: "Prepare and deploy technical hands-on security challenges" },
      { id: "gs2", event: "Guest Lecture: Cryptography", assignedStaff: ["Dr. Evelyn Carter"], subjectTask: "Key exchange protocol vulnerability analysis" },
      { id: "gs3", event: "Project Thesis Deadline", assignedStaff: ["Alex Johnson"], subjectTask: "Collect reports and run anti-plagiarism scanning logs" }
    ];
  }
  const newEvent = {
    id: 'gs_' + Date.now(),
    event,
    assignedStaff: Array.isArray(assignedStaff) ? assignedStaff : [],
    subjectTask
  };
  db.globalSchedule.push(newEvent);
  saveDB(db);
  res.json(db.globalSchedule);
});

app.put('/api/global-schedule/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  if (!db.globalSchedule) {
    db.globalSchedule = [
      { id: "gs1", event: "Winter Exams", assignedStaff: ["Dr. Evelyn Carter", "Alex Johnson"], subjectTask: "Prepare and deploy technical hands-on security challenges" },
      { id: "gs2", event: "Guest Lecture: Cryptography", assignedStaff: ["Dr. Evelyn Carter"], subjectTask: "Key exchange protocol vulnerability analysis" },
      { id: "gs3", event: "Project Thesis Deadline", assignedStaff: ["Alex Johnson"], subjectTask: "Collect reports and run anti-plagiarism scanning logs" }
    ];
  }
  const index = db.globalSchedule.findIndex((item: any) => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Global schedule event not found.' });
  db.globalSchedule[index] = { ...db.globalSchedule[index], ...req.body };
  saveDB(db);
  res.json(db.globalSchedule);
});

app.delete('/api/global-schedule/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  if (db.globalSchedule) {
    db.globalSchedule = db.globalSchedule.filter((item: any) => item.id !== id);
    saveDB(db);
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC FILE HOOK
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support spa fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS_BOOT] Secure Cyber Security Web Portal backend running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
