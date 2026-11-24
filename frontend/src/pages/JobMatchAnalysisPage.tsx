import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Job, JobMatch } from '../types';
import { useToast } from '../components/common/Toast';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  Sparkles,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Mail,
  HelpCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

export const JobMatchAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job_id');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    initialJobId ? parseInt(initialJobId, 10) : null
  );
  const [matchData, setMatchData] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      runMatch(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const resp = await api.get<{ jobs: Job[] }>('/jobs?limit=30');
      setJobs(resp.data.jobs);
      if (!selectedJobId && resp.data.jobs.length > 0) {
        setSelectedJobId(resp.data.jobs[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load jobs list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runMatch = async (jobId: number) => {
    setAnalyzing(true);
    try {
      const resp = await api.post<JobMatch>(`/jobs/${jobId}/match`, {});
      setMatchData(resp.data);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Please upload a resume first to run match analysis.';
      showToast(msg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Autonomous Job Matching Agent
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Semantic Job Match & Skill Gap Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Deep comparison of your candidate credentials against targeted job specifications.
        </p>
      </div>

      {/* Job Selector Dropdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
          Target Job Listing:
        </label>
        <select
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(parseInt(e.target.value, 10))}
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-500/20"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} — {j.company} ({j.location})
            </option>
          ))}
        </select>
      </div>

      {analyzing ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Job Matching Agent Running Deep Analysis...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting semantic keyword overlap, cross-referencing experience longevity, and mapping technical skills.
          </p>
        </div>
      ) : matchData && selectedJob ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role</span>
              <h2 className="text-2xl font-extrabold text-slate-900">{selectedJob.title}</h2>
              <div className="text-sm text-slate-600 font-medium">
                {selectedJob.company} • {selectedJob.location} • <span className="font-semibold">{selectedJob.work_mode}</span>
              </div>
            </div>

            <div className="text-center px-8 py-4 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
              <div className="text-4xl font-black text-blue-600">{matchData.match_score}%</div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mt-1">
                Overall Match Score
              </div>
            </div>
          </div>

          {/* Sub-Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Skills Overlap</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-2">{matchData.skills_match_score}%</div>
              <div className="text-xs text-slate-500 mt-1">Direct technical tool alignment</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Experience Longevity</span>
              <div className="text-sm font-bold text-slate-800 mt-2">{matchData.experience_compatibility}</div>
              <div className="text-xs text-slate-500 mt-1">Seniority calibration</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Education Fit</span>
              <div className="text-sm font-bold text-slate-800 mt-2">{matchData.education_compatibility}</div>
              <div className="text-xs text-slate-500 mt-1">Academic credentials</div>
            </div>
          </div>

          {/* Side-by-Side Matching vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Matching Skills ({matchData.matching_skills.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Technologies confirmed present on both your verified resume and the job listing:
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {matchData.matching_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Missing Skills ({matchData.missing_skills.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Technologies requested by employer not found in your current resume:
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {matchData.missing_skills.length === 0 ? (
                  <span className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-semibold">
                    Zero gaps detected! Your profile encompasses 100% of the primary required stack.
                  </span>
                ) : (
                  matchData.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold"
                    >
                      ✗ {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Key Strengths
              </h3>
              <ul className="space-y-2">
                {matchData.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500 rotate-180" /> Focus Areas & Gaps
              </h3>
              <ul className="space-y-2">
                {matchData.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Agent Recommendations & Next Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">Agent Recommendations & Next Steps</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {matchData.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  {rec}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/cover-letter?job_id=${selectedJob.id}&title=${encodeURIComponent(selectedJob.title)}&company=${encodeURIComponent(selectedJob.company)}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" /> Draft Tailored Cover Letter
              </Link>
              <Link
                to={`/interview-prep?job_id=${selectedJob.id}&title=${encodeURIComponent(selectedJob.title)}`}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Prepare Interview Questions
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
