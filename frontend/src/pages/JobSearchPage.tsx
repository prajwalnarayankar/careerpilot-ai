import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Job, JobSearchResponse } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Bookmark,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  Building2,
  Calendar
} from 'lucide-react';

export const JobSearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('Python Developer');
  const [location, setLocation] = useState('Bangalore');
  const [experience, setExperience] = useState('Fresher / 0-2 years');
  const [workMode, setWorkMode] = useState('All');
  const [source, setSource] = useState('all');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingJobId, setSavingJobId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.post<JobSearchResponse>('/jobs/search', {
        keyword: keyword.trim() || undefined,
        location: location.trim() || undefined,
        experience: experience !== 'All' ? experience : undefined,
        work_mode: workMode !== 'All' ? workMode : undefined,
        source,
        limit: 25
      });
      setJobs(resp.data.jobs);
      setTotal(resp.data.total);
    } catch (err) {
      console.error(err);
      showToast('Error searching jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job: Job) => {
    setSavingJobId(job.id);
    try {
      await api.post('/applications', {
        job_id: job.id,
        status: 'Saved',
        notes: `Saved via Job Discovery Agent on ${new Date().toLocaleDateString()}`
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: true, application_status: 'Saved' } : j))
      );
      showToast(`Saved "${job.title}" to your Application Tracker!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save job.', 'error');
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Discovery & Multi-Agent Search</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scout engineering positions across multiple verified source adapters with automated deduplication.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title or skill (e.g. Python Developer)"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Bangalore, Remote)"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Experience */}
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="All">All Experience Levels</option>
              <option value="Fresher / 0-2 years">Fresher / 0–2 years</option>
              <option value="3-5 years">Mid-Level / 3–5 years</option>
              <option value="Senior / 5+ years">Senior / 5+ years</option>
            </select>
          </div>

          {/* Work Mode */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="All">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        {/* Source Adapter Filter & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Source Adapter:</span>
            <div className="flex items-center gap-1.5">
              {['all', 'demo', 'api', 'web'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    source === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All Adapters' : s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Execute Discovery Agent Search
          </button>
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Found <strong>{total}</strong> verified listings matching query</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[10px]">
            Demo Data clearly labeled
          </span>
        </div>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs found matching your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try expanding your keyword or resetting work mode to "All".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  {job.is_demo ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Demo Data
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live Feed
                    </span>
                  )}
                  {job.application_status && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Status: {job.application_status}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {job.company}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {job.work_mode}
                  </span>
                  <span>•</span>
                  <span>{job.experience}</span>
                  {job.salary && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-emerald-600">{job.salary}</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.slice(0, 7).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                  {job.skills.length > 7 && (
                    <span className="text-[10px] text-slate-400 font-medium self-center">
                      +{job.skills.length - 7}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Match Score & Actions */}
              <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                {job.user_match_score !== undefined && (
                  <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="text-xl font-extrabold text-blue-600">{job.user_match_score}%</div>
                    <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">
                      Fit Match
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition text-center shadow-sm"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleSaveJob(job)}
                    disabled={job.is_saved || savingJobId === job.id}
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
      )}
    </div>
  );
};
