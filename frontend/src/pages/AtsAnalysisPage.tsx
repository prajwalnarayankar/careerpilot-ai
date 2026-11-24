import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Resume, ResumeAnalysis, Job } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Award,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Loader2,
  ArrowRight
} from 'lucide-react';

export const AtsAnalysisPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [targetJobId, setTargetJobId] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Python Developer');
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resumesResp, jobsResp] = await Promise.all([
        api.get<Resume[]>('/resumes'),
        api.get<{ jobs: Job[] }>('/jobs?limit=20')
      ]);

      setResumes(resumesResp.data);
      setJobs(jobsResp.data.jobs);

      if (resumesResp.data.length > 0) {
        const primary = resumesResp.data.find((r) => r.is_primary === 1) || resumesResp.data[0];
        setSelectedResumeId(primary.id);
        setAnalysis(primary.latest_analysis || null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load ATS audit data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!selectedResumeId) return;
    setReanalyzing(true);
    try {
      const payload: any = { target_role: targetRole };
      if (targetJobId) {
        payload.target_job_id = parseInt(targetJobId, 10);
      }

      const resp = await api.post<ResumeAnalysis>(`/resumes/${selectedResumeId}/analyze`, payload);
      setAnalysis(resp.data);
      showToast('ATS audit completed against target specifications!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to run ATS re-audit', 'error');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleResumeSelect = (id: number) => {
    setSelectedResumeId(id);
    const chosen = resumes.find((r) => r.id === id);
    if (chosen) {
      setAnalysis(chosen.latest_analysis || null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Upload Your Resume for ATS Audit</h2>
        <p className="text-sm text-slate-500 mt-2">
          To calculate ATS compatibility, keyword density, and formatting compliance, upload your resume first.
        </p>
        <Link
          to="/resumes/upload"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Upload Resume <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-amber-500';
  };

  return (
    <div className="space-y-8">
      {/* Header & Target Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Tracking System (ATS) Audit</h1>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous analysis benchmarking your resume against parsing standards, corporate algorithms, and target roles.
            </p>
          </div>

          {/* Select Active Resume */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Auditing:</span>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleResumeSelect(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename} ({new Date(r.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Re-audit against target job */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Senior Python Developer, Backend Architect)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex-1">
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="">-- Match against specific scouted job (optional) --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company} ({j.location})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 shadow-sm"
          >
            {reanalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Audit Against Target
          </button>
        </div>
      </div>

      {/* Main ATS Score & 5 Sub-metrics */}
      {analysis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-500/20 shadow-sm col-span-2 sm:col-span-1 lg:col-span-1 text-center flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Overall ATS Score
              </span>
              <div className={`text-4xl font-black mt-2 ${scoreColor(analysis.ats_score)}`}>
                {analysis.ats_score}
                <span className="text-base font-medium text-slate-400">/100</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
                {analysis.ats_score >= 80 ? 'Optimal ATS Pass' : analysis.ats_score >= 60 ? 'Competitive Fit' : 'Needs Optimization'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Keyword Match</span>
              <div className="text-2xl font-black text-slate-800 mt-2">{analysis.keyword_match_score}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${analysis.keyword_match_score}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Skills Match</span>
              <div className="text-2xl font-black text-slate-800 mt-2">{analysis.skills_match_score}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${analysis.skills_match_score}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Formatting</span>
              <div className="text-2xl font-black text-slate-800 mt-2">{analysis.formatting_score}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${analysis.formatting_score}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
              <div className="text-2xl font-black text-slate-800 mt-2">{analysis.experience_score}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${analysis.experience_score}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
              <div className="text-2xl font-black text-slate-800 mt-2">{analysis.education_score}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${analysis.education_score}%` }}></div>
              </div>
            </div>
          </div>

          {/* Section Breakdown: Recommendations, Formatting Checks, Measurable Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations & Action Items */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">ATS Agent Recommendations</h3>
              </div>
              <p className="text-xs text-slate-500">
                Actionable improvements to elevate your resume indexing performance:
              </p>

              <div className="space-y-2.5">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs leading-relaxed text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  to="/resume-optimization"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Open Resume Optimizer Agent
                </Link>
              </div>
            </div>

            {/* Formatting Problems & Missing Sections */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">Formatting & Structure Inspection</h3>
              </div>
              <p className="text-xs text-slate-500">
                Audit of standard resume sections and ATS compatibility rules:
              </p>

              <div className="space-y-2.5">
                {analysis.formatting_problems.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Clean structure! No major formatting flags detected.
                  </div>
                ) : (
                  analysis.formatting_problems.map((prob, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{prob}</span>
                    </div>
                  ))
                )}

                {analysis.missing_sections.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700">Missing Section Headers:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {analysis.missing_sections.map((sec, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200 text-[11px]">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Measurable Achievements Found */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Measurable Achievements Detected ({analysis.measurable_achievements.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Quantified metrics</span>
            </div>

            {analysis.measurable_achievements.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No quantitative metrics (percentages, numbers, latency gains) were detected in your bullet points.
                Use the Resume Optimizer Agent to convert tasks into measured accomplishments.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.measurable_achievements.map((ach, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keywords Breakdown: Extracted vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Extracted Profile Keywords ({analysis.extracted_keywords.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.extracted_keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing High-Priority Keywords
              </h3>
              {analysis.missing_keywords.length === 0 ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Great job! No major target keywords are missing for this role profile.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
