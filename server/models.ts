/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. USER SCHEMA (Authentication & Security)
// ==========================================
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'staff' | 'student';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 4,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['staff', 'student'],
      required: true,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// High-speed index for user lookups
UserSchema.index({ username: 1, role: 1 });

// ==========================================
// 2. STUDENT & STAFF SCHEMA (Academic Records)
// ==========================================
export interface IAcademicProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  fatherName: string;
  address: string;
  regulation: string; // e.g., "Regulation 2021"..."Regulation 2025"
  department: 'B.E. Computer Science and Engineering' | 
              'B.E. Computer Science and Engineering (Cyber Security)' | 
              'B.E. Electronics and Communication Engineering';
  certificateUrl?: string; // Secure file-upload path
  certificateName?: string;
  timeTable: {
    day: string; // Monday, Tuesday, etc.
    periods: string[]; // Subject names
  }[];
  academicSchedule: {
    period: string; // e.g., "Period 1 (09:00 - 10:00)"
    subject: string;
    classroom: string;
    instructor: string;
  }[];
}

const AcademicProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 17,
      max: 70,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    regulation: {
      type: String,
      required: true,
      default: 'Regulation 2025',
      index: true,
    },
    department: {
      type: String,
      enum: [
        'B.E. Computer Science and Engineering',
        'B.E. Computer Science and Engineering (Cyber Security)',
        'B.E. Electronics and Communication Engineering'
      ],
      required: true,
    },
    certificateUrl: {
      type: String, // Secure path to local storage or Cloud storage
    },
    certificateName: {
      type: String,
    },
    timeTable: [
      {
        day: { type: String, required: true },
        periods: [{ type: String }],
      }
    ],
    academicSchedule: [
      {
        period: { type: String, required: true },
        subject: { type: String, required: true },
        classroom: { type: String, required: true },
        instructor: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

// High-speed indices for querying academic cohorts
AcademicProfileSchema.index({ regulation: 1, department: 1 });

// ==========================================
// 3. EVENT & ASSOCIATION SCHEMA
// ==========================================
export interface IEvent extends Document {
  title: string;
  date: Date;
  time: string;
  venue: string;
  description: string;
  imageUrl?: string; // Path for upload photo
  createdBy: mongoose.Types.ObjectId; // Staff User ID
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Dynamic uploaded gallery image path
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ==========================================
// 4. EVENT FUND LEDGER SCHEMA
// ==========================================
export interface ILedger extends Document {
  studentName: string;
  registerNumber: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year';
  amount: number;
  screenshotUrl?: string; // Path for screenshot proof
  screenshotName?: string;
  status: 'Pending' | 'Verified';
  date: Date;
}

const LedgerSchema: Schema = new Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    registerNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', 'Final Year'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    screenshotUrl: {
      type: String, // Secure server-side path to transaction proof
    },
    screenshotName: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified'],
      default: 'Pending',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// High-speed indexing for financial reconciliation
LedgerSchema.index({ registerNumber: 1, status: 1 });

// ==========================================
// 5. ACADEMIC ASSESSMENT & QUIZ SCHEMA
// ==========================================
export interface IQuiz extends Document {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
  }[];
  createdBy: mongoose.Types.ObjectId;
}

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true, min: 0, max: 3 },
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Export Mongoose Models for production integration
export const MongooseModels = {
  User: mongoose.models.User || mongoose.model<IUser>('User', UserSchema),
  AcademicProfile: mongoose.models.AcademicProfile || mongoose.model<IAcademicProfile>('AcademicProfile', AcademicProfileSchema),
  Event: mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema),
  Ledger: mongoose.models.Ledger || mongoose.model<ILedger>('Ledger', LedgerSchema),
  Quiz: mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema),
};
