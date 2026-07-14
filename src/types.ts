/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'staff' | 'student';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AcademicScheduleItem {
  id: string;
  period: string; // e.g., "Period 1 (09:00 - 10:00)"
  subject: string;
  classroom: string;
  instructor: string;
}

export interface DayTimeTable {
  day: string; // e.g., "Monday"
  periods: string[]; // List of 5-6 period subjects
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  fatherName: string;
  address: string;
  regulation: string; // e.g., "Regulation 2021", "Regulation 2025"
  department: string;
  certificateUrl?: string;
  certificateName?: string;
  timeTable: DayTimeTable[];
  academicSchedule: AcademicScheduleItem[];
}

export interface StaffProfile {
  id: string;
  name: string;
  age: number;
  fatherName: string;
  address: string;
  regulation: string;
  department: string;
  certificateUrl?: string;
  certificateName?: string;
  timeTable: DayTimeTable[];
  academicSchedule: AcademicScheduleItem[];
}

export interface Threat {
  id: string;
  title: string;
  type: 'good' | 'bad'; // Good = defense/patch, Bad = threat/active breach
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  actionOrPatch: string;
}

export interface JobListing {
  id: string;
  role: string;
  company: string;
  vacancy: number;
  salary?: string;
  requirements: string;
  location: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  imageUrl?: string; // event gallery
}

export interface LedgerEntry {
  id: string;
  studentName: string;
  registerNumber: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year';
  amount: number;
  screenshotUrl?: string;
  screenshotName?: string;
  status: 'Pending' | 'Verified';
  date: string;
  department?: string;
  eventName?: string;
  transactionId?: string;
}

export interface ClassTest {
  id: string;
  subject: string;
  date: string;
  maxMarks: number;
  marks: { [studentName: string]: number };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}
