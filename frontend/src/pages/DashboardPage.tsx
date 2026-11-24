import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { DashboardStats } from '../types';
import {
  Briefcase,
  Bookmark,
  Send,
  HelpCircle,
  Percent,
  FileCheck2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const resp = await api.get<DashboardStats>('/dashboard');
      setStats(resp.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Career Copilot Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome to Your AI Career Command Center
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Track real-time multi-agent job recommendations, resume ATS scores, and interview performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-sm transition inline-flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Explore Jobs
          </Link>
          <Link
            to="/resumes/upload"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/20 transition inline-flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" /> Upload Resume
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jobs Found</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.total_jobs_found || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Scouted listings</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Jobs</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.saved_jobs_count || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">In your pipeline</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.applications_count || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active proposals</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
            <HelpCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.interviews_count || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Mock & scheduled</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Match</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-blue-600">{stats?.average_match_score || 0}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Resume-to-Job fit</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ATS Score</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">
              {stats?.latest_ats_score ? `${stats.latest_ats_score}/100` : 'Not Audited'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Latest resume index</span>
          </div>
        </div>
      </div>

      {/* Row of Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Application Pipeline by Status</h3>
              <p className="text-xs text-slate-500">Distribution across active Kanban stages</p>
            </div>
            <Link to="/applications" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
              View Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.applications_by_status || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {(stats?.applications_by_status || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Jobs by Tech Domain</h3>
              <p className="text-xs text-slate-500">Active postings categorized across industries</p>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
              Search Roles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.jobs_by_category || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.jobs_by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {(stats?.jobs_by_category || []).map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 truncate max-w-[120px]">{c.name} ({c.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Match Score Distribution & Application Activity Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900">Match Score Distribution</h3>
            <p className="text-xs text-slate-500">Candidate compatibility across current market openings</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.match_score_distribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {(stats?.match_score_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Activity Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900">Application Velocity (7-Day Activity)</h3>
            <p className="text-xs text-slate-500">Daily job submissions and status movements</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.application_activity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Recommended Jobs & Skills to Improve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Top Recommended Matches</h3>
              <p className="text-xs text-slate-500">Filtered by Job Matching Agent according to your profile</p>
            </div>
            <Link to="/jobs/recommended" className="text-xs font-semibold text-blue-600 hover:underline">
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {(stats?.recommended_jobs || []).slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h4>
                    {job.is_demo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                        Demo Data
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {job.company} • {job.location} • <span className="font-medium text-slate-700">{job.work_mode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600">{job.user_match_score || 85}%</span>
                    <span className="text-[10px] text-slate-400 block">Match</span>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Role
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills to Improve Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">Skills to Boost Match Rate</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Identified by comparing your resume with requirements of high-matching roles:
            </p>

            <div className="space-y-2">
              {(stats?.skills_to_improve || []).map((skill, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{skill}</span>
                  <span className="text-[11px] font-bold text-blue-600">+12% fit</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/insights"
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
          >
            Explore AI Career Insights <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
