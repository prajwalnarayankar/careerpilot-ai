import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { InterviewSession, InterviewQuestion, InterviewAnswer } from '../types';
import { useToast } from '../components/common/Toast';
import {
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen
} from 'lucide-react';

export const MockInterviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const resp = await api.get<InterviewSession[]>('/interview/sessions');
      setSessions(resp.data);
      if (resp.data.length > 0) {
        let chosen = resp.data[0];
        if (sessionIdParam) {
          const found = resp.data.find((s) => s.id === parseInt(sessionIdParam, 10));
          if (found) chosen = found;
        }
        await loadSessionDetails(chosen.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load mock interview sessions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (id: number) => {
    try {
      const resp = await api.get<InterviewSession>(`/interview/sessions/${id}`);
      setActiveSession(resp.data);
      setCurrentQuestionIndex(0);
      setTimerSeconds(0);
      setTimerActive(true);
      if (resp.data.questions.length > 0 && resp.data.questions[0].answer) {
        setUserAnswer(resp.data.questions[0].answer.user_answer);
      } else {
        setUserAnswer('');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading interview session details', 'error');
    }
  };

  const handleSelectQuestion = (idx: number) => {
    if (!activeSession) return;
    setCurrentQuestionIndex(idx);
    const q = activeSession.questions[idx];
    if (q && q.answer) {
      setUserAnswer(q.answer.user_answer);
    } else {
      setUserAnswer('');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !activeSession.questions[currentQuestionIndex]) return;
    if (!userAnswer.trim()) {
      showToast('Please type your response before submitting.', 'error');
      return;
    }

    const q = activeSession.questions[currentQuestionIndex];
    setEvaluating(true);
    try {
      const resp = await api.post<InterviewAnswer>('/interview/evaluate', {
        question_id: q.id,
        user_answer: userAnswer,
      });

      // Update question answer in local state
      const updatedQuestions = [...activeSession.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...q,
        answer: resp.data,
      };

      setActiveSession({
        ...activeSession,
        questions: updatedQuestions,
      });

      showToast('Response evaluated by Interview Agent!', 'success');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to evaluate answer.';
      showToast(msg, 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Active Interview Session</h3>
        <p className="text-xs text-slate-500 mt-1">Generate a session first from the Interview Prep page.</p>
        <Link
          to="/interview-prep"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Go to Interview Prep <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const currentQ: InterviewQuestion | undefined = activeSession.questions[currentQuestionIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Session Header & Timer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Mock Simulator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{activeSession.session_type}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
            {activeSession.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <Link
            to="/interview-prep"
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Switch Session
          </Link>
        </div>
      </div>

      {/* Stepper / Question Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {activeSession.questions.map((q, idx) => {
          const isAnswered = Boolean(q.answer);
          const isCurrent = idx === currentQuestionIndex;
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isAnswered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Q{idx + 1}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">({q.category})</span>
              {isAnswered && <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />}
            </button>
          );
        })}
      </div>

      {/* Active Question Prompt & Answering Workspace */}
      {currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question & Evaluation Left (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {currentQ.category} Question
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question_text}
              </h2>

              {currentQ.context_hint && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Interviewer Focus:</strong> {currentQ.context_hint}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Textarea */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Candidate Response:
                </label>
                <span className="text-[11px] text-slate-400">
                  Tip: Use STAR framework (Situation, Task, Action, Result)
                </span>
              </div>

              <textarea
                rows={7}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response here thoroughly... detail technical choices, trade-offs, and metrics achieved."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed transition"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words entered
                </span>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit for AI Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Evaluation Results Card */}
            {currentQ.answer && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-emerald-500/30 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900">AI Evaluation & Scoring</h3>
                      <p className="text-xs text-slate-500">Graded by Interview Agent</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="text-3xl font-black text-emerald-600">
                      {currentQ.answer.evaluation_score}
                      <span className="text-sm font-medium text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Constructive Feedback:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {currentQ.answer.feedback}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths
                    </span>
                    <ul className="space-y-1 text-emerald-800">
                      {currentQ.answer.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Areas to Improve
                    </span>
                    <ul className="space-y-1 text-amber-800">
                      {currentQ.answer.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improved Model Answer */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Model / Star Benchmark Answer:
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {currentQ.answer.improved_answer}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Key Points & Navigation */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Key Points Interviewers Seek:
              </h4>
              <ul className="space-y-2">
                {currentQ.sample_key_points.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleSelectQuestion(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <button
                onClick={() =>
                  handleSelectQuestion(
                    Math.min(activeSession.questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                disabled={currentQuestionIndex === activeSession.questions.length - 1}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
