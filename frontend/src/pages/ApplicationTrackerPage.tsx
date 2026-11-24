import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { KanbanColumn, Application, Job } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Kanban,
  Building2,
  MapPin,
  Calendar,
  MoveRight,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  Loader2,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const STATUS_ORDER = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Saved: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  Applied: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Assessment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Interview: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Offer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const ApplicationTrackerPage: React.FC = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingAppId, setMovingAppId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchKanban();
  }, []);

  const fetchKanban = async () => {
    try {
      setLoading(true);
      const resp = await api.get<KanbanColumn[]>('/applications/kanban');
      setColumns(resp.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load application tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStatus = async (appId: number, nextStatus: string) => {
    setMovingAppId(appId);
    try {
      await api.put(`/applications/${appId}`, { status: nextStatus });
      showToast(`Application moved to ${nextStatus}`, 'success');
      await fetchKanban();
    } catch (err) {
      console.error(err);
      showToast('Failed to move application status', 'error');
    } finally {
      setMovingAppId(null);
    }
  };

  const handleDelete = async (appId: number) => {
    if (!window.confirm('Are you sure you want to remove this application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      showToast('Application deleted.', 'info');
      await fetchKanban();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete application.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Kanban className="w-3.5 h-3.5" /> Pipeline Management
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Tracker (Kanban)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and progress your job applications across every recruitment stage. All state updates are persisted in SQLite.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Find & Add Jobs
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {STATUS_ORDER.map((st) => (
            <div key={st} className="h-96 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const styles = STATUS_COLORS[col.status] || STATUS_COLORS['Saved'];
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col h-[700px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {col.status}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>
                    {col.count}
                  </span>
                </div>

                {/* Applications list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {col.applications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      Empty
                    </div>
                  ) : (
                    col.applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-xs hover:text-blue-600 transition leading-snug">
                            {app.job ? (
                              <Link to={`/jobs/${app.job.id}`}>{app.job.title}</Link>
                            ) : (
                              'Engineering Role'
                            )}
                          </h4>
                          <button
                            onClick={() => handleDelete(app.id)}
                            title="Remove"
                            className="text-slate-300 hover:text-rose-600 transition shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {app.job?.company || 'Company'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {app.job?.location} • {app.job?.work_mode}
                          </div>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Move status picker */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Move:</span>
                          <select
                            value={app.status}
                            disabled={movingAppId === app.id}
                            onChange={(e) => handleMoveStatus(app.id, e.target.value)}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                          >
                            {STATUS_ORDER.map((st) => (
                              <option key={st} value={st}>
                                → {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
