import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  UploadCloud,
  FileCheck2,
  Search,
  Sparkles,
  GitCompare,
  Wand2,
  Mail,
  HelpCircle,
  PlayCircle,
  Kanban,
  Lightbulb,
  Settings,
  Compass
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "AI Career Insights", path: "/insights", icon: Lightbulb, badge: "AI" },
        { label: "My Profile", path: "/profile", icon: User },
      ]
    },
    {
      title: "Resume & ATS",
      items: [
        { label: "Resume Manager", path: "/resumes", icon: FileText },
        { label: "Upload Resume", path: "/resumes/upload", icon: UploadCloud },
        { label: "ATS Analysis", path: "/ats-analysis", icon: FileCheck2 },
        { label: "Resume Optimizer", path: "/resume-optimization", icon: Wand2, badge: "Agent" },
      ]
    },
    {
      title: "Jobs & Matching",
      items: [
        { label: "Job Discovery", path: "/jobs", icon: Search },
        { label: "Recommended Jobs", path: "/jobs/recommended", icon: Sparkles },
        { label: "Job Match Analysis", path: "/match-analysis", icon: GitCompare },
      ]
    },
    {
      title: "Applications & Prep",
      items: [
        { label: "Application Tracker", path: "/applications", icon: Kanban, badge: "Kanban" },
        { label: "Cover Letter AI", path: "/cover-letter", icon: Mail },
        { label: "Interview Prep", path: "/interview-prep", icon: HelpCircle },
        { label: "Mock Interview", path: "/mock-interview", icon: PlayCircle, badge: "Sim" },
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", path: "/settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1">
            CareerPilot <span className="text-blue-600 font-extrabold text-sm px-1.5 py-0.5 rounded bg-blue-50">AI</span>
          </span>
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Multi-Agent Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">System Status</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400">All 6 CrewAI agents online</p>
      </div>
    </aside>
  );
};
