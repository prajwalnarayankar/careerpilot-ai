import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { InterviewSession, Job } from '../types';
import { useToast } from '../components/common/Toast';
import {
  HelpCircle,
  PlayCircle,
  Sparkles,
  Award,
  Calendar,
  Briefcase,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job_id');
  const initialTitle = searchParams.get('title') || 'Python Developer';

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [roleTarget, setRoleTarget] = useState(initialTitle);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || '');
  const [sessionType, setSessionType] = useState('Comprehensive');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [sessResp, jobsResp] = await Promise.all([
        api.get<InterviewSession[]>('/interview/sessions'),
        api.get<{ jobs: Job[] }>('/jobs?limit=20')
      ]);
      setSessions(sessResp.data);
      setJobs(jobsResp.data.jobs);
    } catch (err) {
      console.error(err);
      showToast('Failed to load interview sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSession = async () => {
    if (!roleTarget.trim()) {
      showToast('Please specify a target role.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const payload: any = {
        role_target: roleTarget,
        session_type: sessionType
      };
      if (selectedJobId) {
        payload.job_id = parseInt(selectedJobId, 10);
      }
      const resp = await api.post<InterviewSession>('/interview/generate', payload);
      showToast('Interview set generated! Directing to simulator...', 'success');
      navigate(`/mock-interview?session_id=${resp.data.id}`);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate interview set.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <HelpCircle className="w-3.5 h-3.5" /> Interview Preparation Agent
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Interview Preparation & Question Generator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Prepare across Technical, Behavioral, System Architecture, Resume-based, and HR questions tailored for your target engineering positions.
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" /> Start a New Interview Simulation Session
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Role
            </label>
            <input
              type="text"
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              placeholder="e.g. Full Stack Python / React"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Session Focus Domain
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="Comprehensive">Comprehensive (All 6 Categories)</option>
              <option value="Technical">Technical & System Architecture</option>
              <option value="Behavioral">Behavioral (Leadership & Conflict)</option>
              <option value="Project-focused">Project & Resume Deep Dive</option>
              <option value="HR">HR & Cultural Alignment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contextual Job (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="">General Industry Standard</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateSession}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Custom Questions...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Launch Mock Interview Simulator
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6 Category Breakdown Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: "Technical", desc: "APIs, async, SQL" },
          { title: "Behavioral", desc: "STAR conflict resolution" },
          { title: "Resume-based", desc: "Past company experience" },
          { title: "Project", desc: "Architecture bottlenecks" },
          { title: "Job-specific", desc: "Role duties & stack" },
          { title: "HR", desc: "Culture & compensation" },
        ].map((c, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-800 block">{c.title}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{c.desc}</span>
          </div>
        ))}
      </div>

      {/* Past Interview Sessions */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900">Your Practice Sessions & History</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">No mock interview sessions yet. Launch your first session above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sess.title}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                    <span>Focus: {sess.session_type}</span>
                    <span>•</span>
                    <span>{sess.questions.length} questions</span>
                    <span>•</span>
                    <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {sess.overall_score !== null && sess.overall_score !== undefined && (
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-blue-600">{sess.overall_score}%</span>
                      <span className="text-[10px] text-slate-400 block">Avg Score</span>
                    </div>
                  )}

                  <Link
                    to={`/mock-interview?session_id=${sess.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    Enter Simulator <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
