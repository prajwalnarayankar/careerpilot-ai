import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Job, JobMatch } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  Check,
  GitCompare,
  Mail,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [matchData, setMatchData] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const resp = await api.get<Job>(`/jobs/${id}`);
      setJob(resp.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load job details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatch = async () => {
    if (!id) return;
    setMatching(true);
    try {
      const resp = await api.post<JobMatch>(`/jobs/${id}/match`, {});
      setMatchData(resp.data);
      showToast('Match calculated by Job Matching Agent!', 'success');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Please upload a resume first to run job match.';
      showToast(msg, 'error');
    } finally {
      setMatching(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;
    setSaving(true);
    try {
      await api.post('/applications', {
        job_id: job.id,
        status: 'Saved',
        notes: `Saved from details view on ${new Date().toLocaleDateString()}`
      });
      setJob({ ...job, is_saved: true, application_status: 'Saved' });
      showToast('Job added to your Application Tracker!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="h-60 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-800">Job Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This job listing may have expired or been removed.</p>
        <Link to="/jobs" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search Listings
      </Link>

      {/* Main Job Banner */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              {job.is_demo ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Data
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Ingestion
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 font-medium pt-1">
              <span className="flex items-center gap-1 text-slate-900 font-bold">
                <Building2 className="w-4 h-4 text-slate-400" /> {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                {job.work_mode}
              </span>
              <span>•</span>
              <span>{job.experience}</span>
              {job.salary && (
                <>
                  <span>•</span>
                  <span className="font-extrabold text-emerald-600">{job.salary}</span>
                </>
              )}
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSaveJob}
              disabled={job.is_saved || saving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                job.is_saved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              {job.is_saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> In Tracker
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" /> Save Job
                </>
              )}
            </button>

            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
              >
                Employer Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* AI Agent Action Bar */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Apply with Multi-Agent Assistance:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCalculateMatch}
              disabled={matching}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
              Calculate Match Score
            </button>

            <Link
              to={`/cover-letter?job_id=${job.id}&title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Draft Cover Letter
            </Link>

            <Link
              to={`/interview-prep?job_id=${job.id}&title=${encodeURIComponent(job.title)}`}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Mock Interview Prep
            </Link>
          </div>
        </div>
      </div>

      {/* Match Score Results Card if calculated */}
      {matchData && (
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">
                Job Matching Agent Evaluation: {matchData.match_score}% Fit
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              {matchData.experience_compatibility}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matching Skills (
                {matchData.matching_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchData.matching_skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" /> Missing / Desired Skills (
                {matchData.missing_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchData.missing_skills.length === 0 ? (
                  <span className="text-xs text-emerald-700 font-medium">None! All key skills present.</span>
                ) : (
                  matchData.missing_skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-semibold">
                      ✗ {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {matchData.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
              <span className="font-bold text-slate-900 block">Agent Recommendations:</span>
              <ul className="list-disc list-inside space-y-1">
                {matchData.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Required Skills Badges */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900">Required Technologies & Competencies</h3>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((s, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Role Overview & Responsibilities</h3>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>
    </div>
  );
};
