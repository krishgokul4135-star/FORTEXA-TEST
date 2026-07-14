/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ShieldAlert, Award, FileSpreadsheet, Plus, HelpCircle, 
  CheckCircle2, XCircle, ArrowRight, Play, Check, Trash2, ShieldQuestion, Database
} from 'lucide-react';
import { User, Quiz, QuizQuestion, ClassTest } from '../types';

interface QuizEngineProps {
  user: User;
  onBack: () => void;
}

export default function QuizEngine({ user, onBack }: QuizEngineProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'quiz' | 'tests'>('quiz');

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [studentsList, setStudentsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active quiz playing states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResponses, setQuizResponses] = useState<{ [qId: string]: boolean }>({});

  // Staff: Create Quiz states
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuestions, setNewQuestions] = useState<Partial<QuizQuestion>[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // Staff: Create Class Test states
  const [showTestCreator, setShowTestCreator] = useState(false);
  const [testSubject, setTestSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testMaxMarks, setTestMaxMarks] = useState<number>(50);
  const [testStudentMarks, setTestStudentMarks] = useState<{ [studentName: string]: number }>({});

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchQuizAndTestData = async () => {
    try {
      const [qRes, tRes, sRes] = await Promise.all([
        fetch('/api/quizzes'),
        fetch('/api/class-tests'),
        fetch('/api/records/students')
      ]);

      const qData = await qRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();

      setQuizzes(qData);
      setClassTests(tData);
      
      const names = sData.map((s: any) => s.name);
      setStudentsList(names.length > 0 ? names : ['Alice Johnson', 'Bob Miller', 'Charlie Davis']);
      
      // Seed default marks form values
      const initialMarks: any = {};
      (names.length > 0 ? names : ['Alice Johnson', 'Bob Miller', 'Charlie Davis']).forEach((name: string) => {
        initialMarks[name] = 0;
      });
      setTestStudentMarks(initialMarks);

    } catch (err) {
      console.error('Error fetching quiz metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizAndTestData();
  }, []);

  // Launch a quiz
  const startQuizPlay = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setQuizFinished(false);
    setQuizResponses({});
  };

  // Submit Answer & Go to next
  const handleAnswerSubmit = () => {
    if (selectedOptionIndex === null || !activeQuiz) return;

    const q = activeQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === q.correctAnswer;
    
    setQuizResponses(prev => ({ ...prev, [q.id]: isCorrect }));
    if (isCorrect) setScore(prev => prev + 1);

    // Next Question or Finish
    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Add a blank question block to Quiz Creator
  const handleAddQuestionToCreator = () => {
    setNewQuestions(prev => [
      ...prev,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  // Edit question field in Creator
  const handleCreatorQuestionChange = (qIdx: number, val: string) => {
    const updated = [...newQuestions];
    updated[qIdx].question = val;
    setNewQuestions(updated);
  };

  // Edit option field in Creator
  const handleCreatorOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...newQuestions];
    if (updated[qIdx].options) {
      updated[qIdx].options![optIdx] = val;
    }
    setNewQuestions(updated);
  };

  // Edit correctAnswer index in Creator
  const handleCreatorCorrectAnswerChange = (qIdx: number, val: number) => {
    const updated = [...newQuestions];
    updated[qIdx].correctAnswer = val;
    setNewQuestions(updated);
  };

  // Save Quiz submission (POST to /api/quizzes)
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newQuizTitle) {
      setError('Quiz Title is strictly mandatory.');
      return;
    }

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuizTitle,
          questions: newQuestions
        })
      });

      if (!response.ok) throw new Error('Failed to save quiz to database.');
      
      setNewQuizTitle('');
      setNewQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setShowQuizCreator(false);
      fetchQuizAndTestData();
      setMessage('Interactive technical quiz compiled and published successfully!');
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  // Save Class Test performance (POST to /api/class-tests)
  const handleSaveClassTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!testSubject || !testDate) {
      setError('Form verification failure: subject and dates are mandatory.');
      return;
    }

    try {
      const response = await fetch('/api/class-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: testSubject,
          date: testDate,
          maxMarks: testMaxMarks,
          marks: testStudentMarks
        })
      });

      if (!response.ok) throw new Error('Failed to record class test log.');

      setTestSubject('');
      setTestDate('');
      setTestMaxMarks(50);
      setShowTestCreator(false);
      fetchQuizAndTestData();
      setMessage('Class test internal assessment scores published to records ledger!');
    } catch (err: any) {
      setError(err.message || 'Error writing test results.');
    }
  };

  // Update a single student mark in Logger form
  const handleMarkChange = (name: string, val: number) => {
    setTestStudentMarks(prev => ({
      ...prev,
      [name]: val
    }));
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#f3f4f6] font-mono px-4 md:px-8 py-6 flex flex-col">
      
      {/* Navigation Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-4 mb-6">
        <button
          onClick={activeQuiz ? () => setActiveQuiz(null) : onBack}
          className="flex items-center space-x-2 text-xs text-[#00f2ff] border border-[#00f2ff]/20 bg-[#00f2ff]/5 px-3.5 py-1.5 rounded-sm transition-all cursor-pointer self-start uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{activeQuiz ? 'HALT CURRENT ASSESSMENT' : 'RETURN TO CONTROL PORTAL'}</span>
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-widest text-[#f3f4f6] uppercase glow-text">Assessment & Cyber Quiz Console</h1>
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest">TECHNICAL QUIZ ENGINE // CLASS TEST PERFORMANCE LOGS</p>
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1">
        
        {/* ====================================================================== */}
        /* QUIZ ACTIVE GAMEPLAY PORTAL                                            */
        /* ====================================================================== */
        {activeQuiz ? (
          <div className="max-w-3xl mx-auto bg-[#070e17] border border-cyan-500/30 rounded-xl p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>

            {/* Quiz Progress header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                ASSESSMENT MATRIX: {activeQuiz.title}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {!quizFinished ? `QUESTION ${currentQuestionIndex + 1} OF ${activeQuiz.questions.length}` : 'ASSESSMENT COMPLETE'}
              </span>
            </div>

            {!quizFinished ? (
              /* Active Question block */
              <div className="space-y-6 text-left">
                <div className="flex items-start space-x-3 bg-cyan-950/15 border border-cyan-500/10 p-4 rounded-lg">
                  <ShieldQuestion className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-gray-200 leading-relaxed">
                    {activeQuiz.questions[currentQuestionIndex].question}
                  </p>
                </div>

                {/* Multiple choice selections */}
                <div className="space-y-3">
                  {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`w-full p-3.5 rounded text-left text-xs transition-all border flex items-center justify-between cursor-pointer ${selectedOptionIndex === idx ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300' : 'bg-[#03060b] border-slate-800 text-gray-300 hover:border-slate-700'}`}
                    >
                      <span>{option}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${selectedOptionIndex === idx ? 'border-cyan-400 text-cyan-400 bg-cyan-950' : 'border-slate-700 text-transparent'}`}>
                        {selectedOptionIndex === idx && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-4 border-t border-slate-800/50">
                  <button
                    id="submit-answer-button"
                    onClick={handleAnswerSubmit}
                    disabled={selectedOptionIndex === null}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-black font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span>{currentQuestionIndex + 1 === activeQuiz.questions.length ? 'FINISH ASSESSMENT' : 'COMMIT & NEXT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Finished screen */
              <div className="text-center py-6 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-cyan-400 mb-2 shadow-lg">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Audit Results Compiled</h3>
                  <p className="text-xs text-gray-400 mt-1">Quiz Finished Successfully</p>
                </div>

                {/* Secure score metrics */}
                <div className="max-w-xs mx-auto bg-slate-950 border border-slate-800 rounded-lg p-5">
                  <div className="text-3xl font-black text-cyan-400">{score} / {activeQuiz.questions.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Correct Exploit Resolvers</div>
                  
                  <div className="border-t border-slate-900 mt-4 pt-4 flex justify-between text-xs text-gray-400 font-mono">
                    <span>ACCURACY SCORE:</span>
                    <span className="font-bold text-emerald-400">{Math.round((score / activeQuiz.questions.length) * 100)}%</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    id="quiz-return-list-button"
                    onClick={() => setActiveQuiz(null)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded text-xs text-cyan-400 font-bold uppercase cursor-pointer"
                  >
                    RETURN TO ASSESSMENT DESKTOP
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ====================================================================== */
          /* ASSESSMENT DESKTOP MAIN PANELS                                         */
          /* ====================================================================== */
          <div className="space-y-8">
            
            {/* Top Control Panel */}
            <div className="bg-[#101218] border border-[#1f2937] p-5 rounded-sm flex flex-col lg:flex-row gap-6 justify-between items-center shadow-lg">
              
              {/* Directory selection tabs */}
              <div className="flex bg-[#050608] border border-[#1f2937] rounded-sm p-1">
                <button
                  id="tab-quiz"
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'quiz' ? 'bg-[#00f2ff] text-[#050608]' : 'text-[#9ca3af] hover:text-white'}`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Technical Quiz Engine</span>
                </button>
                <button
                  id="tab-tests"
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'tests' ? 'bg-[#00f2ff] text-[#050608]' : 'text-[#9ca3af] hover:text-white'}`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Class Test Logs</span>
                </button>
              </div>

              {/* Staff Actions */}
              {user.role === 'staff' && (
                <div>
                  {activeTab === 'quiz' ? (
                    <button
                      id="create-quiz-button"
                      onClick={() => setShowQuizCreator(!showQuizCreator)}
                      className="px-4 py-2 bg-[#00f2ff] hover:bg-[#00f2ff]/80 text-[#050608] font-extrabold text-xs rounded-sm transition-all flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showQuizCreator ? 'COLLAPSE COMPILER' : 'CREATE QUIZ'}</span>
                    </button>
                  ) : (
                    <button
                      id="create-test-button"
                      onClick={() => setShowTestCreator(!showTestCreator)}
                      className="px-4 py-2 bg-[#00f2ff] hover:bg-[#00f2ff]/80 text-[#050608] font-extrabold text-xs rounded-sm transition-all flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showTestCreator ? 'COLLAPSE LOGGER' : 'RECORD CLASS TEST'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sub-Section Forms */}
            {activeTab === 'quiz' && (
              /* Quiz compiler (Staff form) */
              <AnimatePresence>
                {showQuizCreator && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveQuiz}
                    className="bg-[#101218] border border-[#00f2ff]/20 p-5 rounded-sm space-y-5 text-left shadow-lg"
                  >
                    <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-widest border-b border-[#1f2937] pb-2">Compile Secure Technical Quiz</h3>
                    
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 uppercase">Quiz Assessment Title</label>
                      <input
                        type="text"
                        required
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                        placeholder="e.g. Advanced Buffer Overflow Exploits"
                        className="w-full bg-[#03060c] border border-slate-800 rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-4 pt-2">
                      {newQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-[#03060c] border border-slate-800 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Question #{qIdx + 1} Block</span>
                          </div>

                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">Question Description String</label>
                            <input
                              type="text"
                              required
                              value={q.question}
                              onChange={(e) => handleCreatorQuestionChange(qIdx, e.target.value)}
                              placeholder="e.g. Which register stores the return address of a function during execution?"
                              className="w-full bg-[#070e17] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options?.map((opt, optIdx) => (
                              <div key={optIdx}>
                                <label className="block text-[8px] text-gray-500 mb-0.5">Option {optIdx + 1}</label>
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => handleCreatorOptionChange(qIdx, optIdx, e.target.value)}
                                  placeholder={`e.g. Option ${String.fromCharCode(65 + optIdx)}`}
                                  className="w-full bg-[#070e17] border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Correct option selector */}
                          <div className="max-w-xs">
                            <label className="block text-[9px] text-gray-400 mb-1">Identify Correct Answer Vector</label>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => handleCreatorCorrectAnswerChange(qIdx, Number(e.target.value))}
                              className="w-full bg-[#070e17] border border-slate-800 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value={0}>Option 1 (A) is correct</option>
                              <option value={1}>Option 2 (B) is correct</option>
                              <option value={2}>Option 3 (C) is correct</option>
                              <option value={3}>Option 4 (D) is correct</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-800">
                      <button
                        id="add-question-builder-button"
                        type="button"
                        onClick={handleAddQuestionToCreator}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded text-[10px] text-cyan-400 font-bold"
                      >
                        APPEND ANOTHER QUESTION BLOCK
                      </button>

                      <div className="flex space-x-2">
                        <button
                          id="submit-compiled-quiz-button"
                          type="submit"
                          className="px-5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded transition-all cursor-pointer"
                        >
                          COMPILE & DEPLOY QUIZ
                        </button>
                        <button
                          id="abort-compiled-quiz-button"
                          type="button"
                          onClick={() => setShowQuizCreator(false)}
                          className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-400 text-xs rounded cursor-pointer"
                        >
                          ABORT
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            )}

            {activeTab === 'tests' && (
              /* Class test logger (Staff form) */
              <AnimatePresence>
                {showTestCreator && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveClassTest}
                    className="bg-[#070e17] border border-cyan-500/20 p-5 rounded-xl space-y-4 text-left shadow-lg"
                  >
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">Record Internal Class Test Score sheet</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1 uppercase">Test Subject / Code</label>
                        <input
                          type="text"
                          required
                          value={testSubject}
                          onChange={(e) => setTestSubject(e.target.value)}
                          placeholder="e.g. Cryptography (CY-502)"
                          className="w-full bg-[#03060c] border border-slate-800 rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1 uppercase">Date of Examination</label>
                        <input
                          type="date"
                          required
                          value={testDate}
                          onChange={(e) => setTestDate(e.target.value)}
                          className="w-full bg-[#03060c] border border-slate-800 rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1 uppercase">Maximum Attainable Marks</label>
                        <input
                          type="number"
                          required
                          value={testMaxMarks}
                          onChange={(e) => setTestMaxMarks(Number(e.target.value))}
                          className="w-full bg-[#03060c] border border-slate-800 rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Student Scores Sheet */}
                    <div className="border border-slate-800 rounded bg-[#03060c] p-4">
                      <h4 className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 font-bold">Class Score Ledger</h4>
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {studentsList.map((name) => (
                          <div key={name} className="flex items-center justify-between gap-4 text-xs">
                            <span className="font-bold text-gray-300">{name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={testMaxMarks}
                                value={testStudentMarks[name] || 0}
                                onChange={(e) => handleMarkChange(name, Number(e.target.value))}
                                className="bg-[#070e17] border border-slate-800 rounded px-2.5 py-1 w-20 text-center text-white"
                              />
                              <span className="text-gray-500">/ {testMaxMarks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        id="submit-test-ledger-button"
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded transition-all cursor-pointer"
                      >
                        PUBLISH TEST RESULTS
                      </button>
                      <button
                        id="abort-test-ledger-button"
                        type="button"
                        onClick={() => setShowTestCreator(false)}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-gray-400 text-xs rounded cursor-pointer"
                      >
                        ABORT
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            )}

            {/* Display Lists */}
            {isLoading ? (
              <p className="text-xs text-gray-500 text-center py-12">Buffering assessment metrics...</p>
            ) : (
              activeTab === 'quiz' ? (
                /* Interactive technical quizzes block */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Connected External Quiz Engine Card */}
                  <div className="bg-[#091b2c] border-2 border-[#00f2ff]/50 rounded-xl p-5 flex flex-col justify-between hover:border-[#00f2ff] transition-all group shadow-[0_0_15px_rgba(0,242,255,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00f2ff]/10 to-transparent pointer-events-none"></div>
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[8px] bg-[#00f2ff]/20 text-[#00f2ff] font-bold uppercase tracking-widest font-mono border border-[#00f2ff]/30">
                      CONNECTED ENGINE
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="p-2 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20">
                          <ShieldAlert className="w-4 h-4 animate-pulse" />
                        </span>
                        <span className="text-[9px] text-[#00ffa3] uppercase font-mono tracking-widest font-bold">PRIMARY TECHNICAL ASSESSMENT</span>
                      </div>

                      <h3 className="font-extrabold text-white text-base tracking-wide uppercase mb-2 group-hover:text-[#00f2ff] transition-colors">
                        Advanced Cyber Security Quiz Node
                      </h3>
                      <p className="text-gray-300 text-[11px] leading-relaxed mb-4">
                        Launch the primary live technical quiz engine node to proceed with your advanced cybersecurity certification, exploit vectors, and assessment verification logs.
                      </p>
                      <div className="bg-[#030c14] border border-[#00f2ff]/10 p-2.5 rounded-sm text-[9px] font-mono text-cyan-300 mb-4 break-all">
                        <span className="text-gray-500 block uppercase mb-1">SECURE TARGET URL:</span>
                        https://share.google/sxA6aurUTFJXQHHD3
                      </div>
                    </div>

                    <a
                      href="https://share.google/sxA6aurUTFJXQHHD3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-gradient-to-r from-[#00f2ff] to-cyan-500 hover:from-[#00ffa3] hover:to-cyan-400 text-[#050608] rounded font-black text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 text-center uppercase shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#050608]" />
                      <span>CONTINUE TO QUIZ</span>
                    </a>
                  </div>

                  {quizzes.map((q) => (
                    <div key={q.id} className="bg-[#070e17] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all group shadow-md">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="p-1.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/10">
                            <HelpCircle className="w-4 h-4" />
                          </span>
                          <span className="text-[9px] text-gray-500 uppercase font-mono">{q.questions.length} EXPLOIT QUESTIONS</span>
                        </div>

                        <h3 className="font-extrabold text-gray-200 text-sm tracking-wide uppercase mb-2 group-hover:text-cyan-400 transition-colors">{q.title}</h3>
                        <p className="text-gray-400 text-[11px] leading-relaxed mb-4">Programmatically generated cybersecurity multiple-choice assessment testing cryptography, port bindings, and defense mechanisms.</p>
                      </div>

                      <button
                        id={`start-quiz-${q.id}`}
                        onClick={() => startQuizPlay(q)}
                        className="w-full py-2 bg-cyan-950/40 hover:bg-cyan-500 hover:text-black border border-cyan-500/25 rounded font-extrabold text-xs text-cyan-400 tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>LAUNCH ASSESSMENT EXAM</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Class tests records sheets logs */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classTests.map((ct) => {
                    const studentNames = Object.keys(ct.marks);
                    const totalMarks = studentNames.reduce((sum, name) => sum + ct.marks[name], 0);
                    const average = studentNames.length > 0 ? (totalMarks / studentNames.length).toFixed(1) : '0.0';

                    return (
                      <div key={ct.id} className="bg-[#070e17] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
                        <div>
                          <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                            <div>
                              <h3 className="font-extrabold text-gray-200 text-xs uppercase tracking-wide">{ct.subject}</h3>
                              <p className="text-[9px] text-gray-500 font-mono mt-0.5">EXAM DATE: {ct.date}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[8px] bg-slate-950/60 text-emerald-400 border border-slate-800 font-bold uppercase">
                              AVG: {average} / {ct.maxMarks}
                            </span>
                          </div>

                          {/* Scores List */}
                          <div className="space-y-2 mt-4 text-[11px] bg-slate-950/40 p-3 rounded border border-slate-900 mb-2">
                            {studentNames.map((name) => {
                              const score = ct.marks[name];
                              const isExcellent = score >= ct.maxMarks * 0.85;
                              return (
                                <div key={name} className="flex justify-between items-center py-1 border-b border-slate-900/50 last:border-0">
                                  <span className="text-gray-300 font-mono">{name}</span>
                                  <span className={`font-extrabold ${isExcellent ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {score} <span className="text-gray-600 text-[10px]">/ {ct.maxMarks}</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-[9px] text-gray-500 uppercase font-mono tracking-widest text-right mt-3">
                          ACADEMIC RECORD SEALED // SEC_AUDIT_VERIFIED
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}
