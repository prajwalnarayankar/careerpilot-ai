import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Resume } from '../types';
import { useToast } from '../components/common/Toast';
import {
  FileText,
  UploadCloud,
  Award,
  Sparkles,
  Trash2,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const ResumeManagerPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const resp = await api.get<Resume[]>('/resumes');
      setResumes(resp.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load resumes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter((r) => r.id !== id));
      showToast('Resume removed.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete resume.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage multiple versions of your resume tailored for different career tracks.</p>
        </div>
        <Link
          to="/resumes/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
        >
          <UploadCloud className="w-4 h-4" /> Upload New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No resumes uploaded yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your PDF or DOCX resume to unlock autonomous ATS scoring, job match calculations, and AI recommendations.
          </p>
          <Link
            to="/resumes/upload"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Upload Resume Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                    {r.file_type}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{r.original_filename}</h3>
                      {r.is_primary === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span>Candidate: <strong>{r.candidate_name || 'Verified'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {r.skills.slice(0, 8).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                  {r.skills.length > 8 && (
                    <span className="text-[11px] text-slate-400 font-medium self-center">
                      +{r.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side Stats & Actions */}
              <div className="flex items-center gap-6 self-end md:self-center shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600">
                    {r.latest_analysis?.ats_score ? `${r.latest_analysis.ats_score}/100` : 'Pending'}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    ATS Audit Score
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/ats-analysis"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" /> View ATS Audit
                  </Link>

                  <Link
                    to="/resume-optimization"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Optimize
                  </Link>

                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Delete resume"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
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
