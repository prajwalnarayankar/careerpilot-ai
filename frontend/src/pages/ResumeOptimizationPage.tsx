import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Resume, Job, ResumeOptimizationResponse } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lightbulb,
  FileText
} from 'lucide-react';

export const ResumeOptimizationPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [targetJobId, setTargetJobId] = useState<string>('');
  const [targetRole, setTargetRole] = useState('Senior Python Developer');
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<ResumeOptimizationResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      const [resumesResp, jobsResp] = await Promise.all([
        api.get<Resume[]>('/resumes'),
        api.get<{ jobs: Job[] }>('/jobs?limit=20')
      ]);
      setResumes(resumesResp.data);
      setJobs(jobsResp.data.jobs);
      if (resumesResp.data.length > 0) {
        const primary = resumesResp.data.find((r) => r.is_primary === 1) || resumesResp.data[0];
        setSelectedResumeId(primary.id);
        runOptimization(primary.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load prerequisite data', 'error');
    }
  };

  const runOptimization = async (resumeId?: number) => {
    const rId = resumeId || selectedResumeId;
    if (!rId) return;

    setOptimizing(true);
    try {
      const payload: any = { target_role: targetRole };
      if (targetJobId) {
        payload.target_job_id = parseInt(targetJobId, 10);
      }
      const resp = await api.post<ResumeOptimizationResponse>(`/resumes/${rId}/optimize`, payload);
      setResult(resp.data);
      showToast('Resume optimization generated!', 'success');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to optimize resume.';
      showToast(msg, 'error');
    } finally {
      setOptimizing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Wand2 className="w-3.5 h-3.5" /> Resume Optimization Agent
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Resume & Bullet Point Refinement
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Refactor bullet points using Google's X-Y-Z formula (Accomplished [X] as measured by [Y] by doing [Z]).
        </p>
      </div>

      {/* Ethical Guardrail Notice */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>Strict Ethical Policy:</strong> The Resume Optimization Agent will never invent companies, dates, certifications, degrees, or experience you do not have. Suggestions only reframe and quantify your authentic contributions.
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Resume
            </label>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Match Target Job (Optional)
            </label>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="">General Market Optimization</option>
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
            onClick={() => runOptimization()}
            disabled={optimizing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Generate Optimization Suggestions
          </button>
        </div>
      </div>

      {optimizing ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Analyzing Your Bullet Points & Experience...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Reframing tasks into assertive action verbs, calculating impact factors, and targeting keyword density.
          </p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Optimized Professional Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Optimized Professional Summary
              </h3>
              <button
                onClick={() => copyToClipboard(result.optimized_summary, 'summary')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === 'summary' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Summary
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {result.optimized_summary}
            </p>
          </div>

          {/* Bullet Points Transformation Comparison (Before vs After) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Bullet Point Refinement (Before vs. After)
              </h3>
              <p className="text-xs text-slate-500">
                Transform passive task descriptions into assertive achievements containing quantifiable metrics.
              </p>
            </div>

            <div className="space-y-4">
              {result.improved_bullet_points.map((bp, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      Impact Factor: {bp.impact_factor}
                    </span>
                    <button
                      onClick={() => copyToClipboard(bp.improved, `bp-${i}`)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition"
                    >
                      {copiedKey === `bp-${i}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Original */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Original Bullet
                      </span>
                      <p className="text-slate-600 leading-relaxed">{bp.original}</p>
                    </div>

                    {/* Improved */}
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        AI Improved (STAR Format)
                      </span>
                      <p className="text-slate-900 font-medium leading-relaxed">{bp.improved}</p>
                    </div>
                  </div>

                  {bp.skills_highlighted.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-[11px] font-semibold">Skills Highlighted:</span>
                      {bp.skills_highlighted.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Skills & Keywords to Incorporate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Recommended Candidate Skills
              </h3>
              <p className="text-xs text-slate-500">From your verified repertoire that strongly align with {targetRole}:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.recommended_skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Keyword Recommendations
              </h3>
              <p className="text-xs text-slate-500">Integrate these industry keywords naturally into your experience summaries:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_recommendations.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
