import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, User as UserIcon, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Autonomous Multi-Agent Mode
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            CrewAI Orchestration
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/resumes/upload"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Upload & Audit Resume
        </Link>

        {/* User profile dropdown / info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-800 leading-none">
                {user?.full_name || 'Guest Candidate'}
              </div>
              <div className="text-xs text-slate-500 mt-1">{user?.email}</div>
            </div>
          </Link>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
