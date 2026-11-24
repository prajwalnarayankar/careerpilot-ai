import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [llmProvider, setLlmProvider] = useState('local');
  const [llmModel, setLlmModel] = useState('heuristic-nlp-engine');
  const [apiKey, setApiKey] = useState('');
  const [demoMode, setDemoMode] = useState(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testingHealth, setTestingHealth] = useState(false);

  useEffect(() => {
    testHealth();
  }, []);

  const testHealth = async () => {
    setTestingHealth(true);
    try {
      const resp = await api.get('/health');
      setHealthStatus(resp.data);
      setDemoMode(resp.data.demo_mode);
      setLlmProvider(resp.data.llm_provider);
    } catch (err) {
      console.error(err);
      setHealthStatus({ status: 'error' });
    } finally {
      setTestingHealth(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Client configuration updated. Backend settings take effect via .env file.', 'success');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
          <SettingsIcon className="w-3.5 h-3.5" /> System & AI Configuration
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Preferences & LLM Provider
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure provider-independent AI model abstractions, verify backend service health, and manage demo configurations.
        </p>
      </div>

      {/* Backend Health Check Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Backend Server Health Check</h3>
          </div>
          <button
            onClick={testHealth}
            disabled={testingHealth}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            {testingHealth ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
            Ping /api/health
          </button>
        </div>

        {healthStatus && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Service Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> {healthStatus.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-slate-600">
              <div>App: <strong>{healthStatus.app}</strong></div>
              <div>Version: <strong>{healthStatus.version}</strong></div>
              <div>Demo Mode: <strong>{String(healthStatus.demo_mode)}</strong></div>
              <div>LLM Provider: <strong>{healthStatus.llm_provider}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* LLM Provider Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" /> AI Layer & LLM Model Abstraction
        </h3>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
          <strong>Autonomous Fallback Engine:</strong> CareerPilot AI is engineered to be 100% operational with offline NLP heuristic intelligence when no external LLM API keys are provided. When an OpenAI, Gemini, or Anthropic key is configured in your environment, high-throughput model inference activates automatically.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Active LLM Provider
            </label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="local">Local Intelligent NLP Engine (Offline / Demo)</option>
              <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
              <option value="gemini">Google Gemini (Gemini 1.5 Flash / Pro)</option>
              <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Model Identifier
            </label>
            <input
              type="text"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini, gemini-1.5-flash"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Provider API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... (Stored securely in .env in production)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Never committed to version control. Read from environment variable <code>LLM_API_KEY</code>.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-700">Enable Demo Mode Data Fallbacks</span>
          </label>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
