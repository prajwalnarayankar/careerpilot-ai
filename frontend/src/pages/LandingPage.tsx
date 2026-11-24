import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Search,
  FileCheck2,
  GitCompare,
  Wand2,
  Mail,
  HelpCircle,
  Kanban,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const agents = [
    {
      name: "Job Discovery Agent",
      role: "Multi-Source Market Scout",
      icon: Search,
      desc: "Aggregates tech listings from live APIs, developer RSS feeds, and verified repositories with deduplication.",
      badge: "Real-Time Ingestion"
    },
    {
      name: "Resume / ATS Agent",
      role: "Compliance & Parsing Auditor",
      icon: FileCheck2,
      desc: "Extracts deep skills, experience, and education from PDF/DOCX resumes. Scored 0-100 against ATS filters.",
      badge: "NLP Parsing"
    },
    {
      name: "Job Matching Agent",
      role: "Semantic Fit Evaluator",
      icon: GitCompare,
      desc: "Computes multidimensional match scores between your resume and target jobs with skill overlap breakdown.",
      badge: "Semantic Scoring"
    },
    {
      name: "Resume Optimizer Agent",
      role: "STAR Achievement Refiner",
      icon: Wand2,
      desc: "Enhances bullet points into quantified impact statements using Google's X-Y-Z formula without false data.",
      badge: "Zero Fabrication"
    },
    {
      name: "Cover Letter Agent",
      role: "Executive Narrative Writer",
      icon: Mail,
      desc: "Drafts tailored, compelling cover letters matching candidate experience to employer mission.",
      badge: "Role-Specific"
    },
    {
      name: "Interview Agent",
      role: "Mock Simulator & Evaluator",
      icon: HelpCircle,
      desc: "Generates technical and behavioral question sets. Evaluates your answers with instant AI feedback & model answers.",
      badge: "Mock Simulator"
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Create Profile", desc: "Set your target role, experience, and work preference." },
    { step: "02", title: "Upload Resume", desc: "Extract structured skills & education with instant ATS audit." },
    { step: "03", title: "Job Discovery", desc: "Scout live openings filtered by keywords, location & remote mode." },
    { step: "04", title: "AI Job Match", desc: "View match percentage, matching skills, and missing keywords." },
    { step: "05", title: "Optimize & Apply", desc: "Generate tailored cover letters and track status on your Kanban." },
    { step: "06", title: "Mock Interview", desc: "Simulate interview rounds and get graded on every answer." }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              CareerPilot <span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 bg-gradient-to-b from-blue-50/50 via-white to-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 border border-blue-200 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Powered by Autonomous CrewAI Multi-Agent Architecture
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            The Autonomous AI Platform for Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Dream Career</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Discover verified jobs, benchmark your resume against corporate ATS algorithms, receive tailored resume optimizations, draft role-specific cover letters, and master mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition transform hover:-translate-y-0.5"
            >
              Start Free Career Pilot <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition"
            >
              Live Demo Access
            </Link>
          </div>

          {/* Social Proof & Trust Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="text-2xl font-extrabold text-blue-600">6 Agents</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">CrewAI Specialized Roles</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="text-2xl font-extrabold text-emerald-600">0 - 100</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">ATS Algorithm Audit Score</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="text-2xl font-extrabold text-indigo-600">STAR Method</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Quantified Bullet Refinement</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="text-2xl font-extrabold text-violet-600">Kanban Board</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Pipeline Status Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Cpu className="w-3.5 h-3.5" /> Multi-Agent Orchestration
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Meet Your Dedicated AI Career Crew
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Instead of a generic chatbot, CareerPilot AI assigns six specialized autonomous agents to every stage of your career workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {agent.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{agent.name}</h3>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      {agent.role}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> End-to-End Pipeline
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              From Candidate Profile to Job Offer
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              A structured, transparent methodology designed to maximize your interview conversion rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((ws, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 relative overflow-hidden">
                <span className="text-4xl font-extrabold text-slate-200 absolute top-4 right-4">{ws.step}</span>
                <h4 className="text-lg font-bold text-slate-900 mb-2 relative z-10">{ws.title}</h4>
                <p className="text-sm text-slate-600 relative z-10 leading-relaxed">{ws.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Navigate Your Next Tech Role?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Experience the multi-agent AI job search platform. Upload your resume and get immediate ATS feedback and tailored job matches.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-blue-600 bg-white hover:bg-blue-50 shadow-lg transition"
          >
            Create Your Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Compass className="w-5 h-5 text-blue-500" />
            CareerPilot AI
          </div>
          <div>Built with FastAPI, SQLite, CrewAI, React, TypeScript, and Tailwind CSS.</div>
          <div className="text-xs text-slate-500">© 2026 CareerPilot AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
