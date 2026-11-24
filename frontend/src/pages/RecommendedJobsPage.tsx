import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Job } from '../types';
import { useToast } from '../components/common/Toast';
import { Sparkles, Building2, MapPin, Bookmark, Check, ArrowRight, GitCompare, Mail } from 'lucide-react';

export const RecommendedJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      setLoading(true);
      const resp = await api.get<Job[]>('/jobs/recommended?limit=15');
      setJobs(resp.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch recommended jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      await api.post('/applications', {
        job_id: job.id,
        status: 'Saved',
        notes: `Saved from recommendations on ${new Date().toLocaleDateString()}`
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: true, application_status: 'Saved' } : j))
      );
      showToast(`Saved "${job.title}" to Application Tracker!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save job.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Job Matching Agent Telemetry
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Recommended Roles</h1>
        <p className="text-sm text-slate-500 mt-1">
          Roles ranked dynamically based on semantic overlap with your verified resume skills and target preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                {job.is_demo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Demo Data
                  </span>
                )}
                {job.application_status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                    Status: {job.application_status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                  {job.work_mode}
                </span>
                {job.salary && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-emerald-600">{job.salary}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-2xl font-black text-blue-600">{job.user_match_score || 85}%</div>
                <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">
                  Match Score
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition text-center shadow-sm"
                >
                  View Details
                </Link>

                <button
                  onClick={() => handleSaveJob(job)}
                  disabled={job.is_saved}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    job.is_saved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {job.is_saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" /> Save Job
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
