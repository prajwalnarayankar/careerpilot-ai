import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { CareerInsights } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<CareerInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const resp = await api.get<CareerInsights>('/insights');
      setInsights(resp.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load career insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Lightbulb className="w-3.5 h-3.5" /> Cross-Agent Career Telemetry
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Career Intelligence & Market Strategy
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Aggregated synthesis combining your parsed resume, ATS metrics, scouted job matches, and pipeline activity into actionable strategic recommendations.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
          Executive Telemetry Summary
        </span>
        <p className="text-base md:text-lg font-medium leading-relaxed text-blue-50">
          {insights.summary}
        </p>
      </div>

      {/* 4 Core Insight Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.insights.map((card, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {card.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Impact: <strong className="text-emerald-600 font-bold">{card.impact_level}</strong>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {card.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                Recommended Actionable Steps:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {card.actionable_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* In-Demand Skills & Target Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In-Demand Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">High-Demand Tech Skills in Scouted Market</h3>
          </div>
          <p className="text-xs text-slate-500">Frequency of technical requirements across currently indexed jobs:</p>

          <div className="space-y-3 pt-1">
            {insights.top_in_demand_skills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{skill.skill} <span className="text-[10px] font-normal text-slate-400">({skill.category})</span></span>
                  <span className="text-blue-600 font-bold">{skill.demand_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${skill.demand_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Roles & Recommended Curriculum */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">Highest-Leverage Target Roles</h3>
            </div>
            <p className="text-xs text-slate-500">Roles where your verified background provides maximum competitive edge:</p>

            <div className="space-y-2">
              {insights.target_role_recommendations.map((role, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{role}</span>
                  <Link to={`/jobs?keyword=${encodeURIComponent(role)}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    Find Openings <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Resources */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Curated Open Courseware & Resources:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insights.learning_resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center justify-between border border-slate-200 transition"
                >
                  <span className="truncate">{res.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formal Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-xs leading-relaxed flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong>Disclaimer:</strong> {insights.disclaimer}
        </div>
      </div>
    </div>
  );
};
