import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { CoverLetter } from '../types';
import { useToast } from '../components/common/Toast';
import {
  Mail,
  Sparkles,
  Copy,
  Download,
  Check,
  RefreshCw,
  Loader2,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const CoverLetterGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job_id');
  const initialTitle = searchParams.get('title') || 'Python Developer';
  const initialCompany = searchParams.get('company') || 'Tech Innovations Inc';

  const [companyName, setCompanyName] = useState(initialCompany);
  const [jobTitle, setJobTitle] = useState(initialTitle);
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [letterId, setLetterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      showToast('Please specify company name and job title.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        company_name: companyName,
        job_title: jobTitle,
        job_description: jobDescription || undefined,
        tone,
        custom_instructions: customInstructions || undefined,
      };
      if (initialJobId) {
        payload.job_id = parseInt(initialJobId, 10);
      }

      const resp = await api.post<CoverLetter>('/cover-letter/generate', payload);
      setGeneratedLetter(resp.data.content);
      setLetterId(resp.data.id);
      showToast('Cover letter generated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to generate cover letter.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    showToast('Cover letter copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Cover letter downloaded.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Mail className="w-3.5 h-3.5" /> Cover Letter Agent
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personalized Cover Letter Generator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Draft role-specific cover letters highlighting your verified credentials without generic filler or fabricated claims.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Job & Target Context
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Python Developer"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tone Style
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="Professional">Professional (Standard)</option>
              <option value="Enthusiastic">Enthusiastic (High Energy)</option>
              <option value="Executive">Executive (Leadership & Scale)</option>
              <option value="Technical">Technical (Deep Engineering Focus)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description (Optional)
            </label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste key requirements or job description excerpt..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Custom Directives (Optional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Highlight PostgreSQL indexing project"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generatedLetter ? 'Regenerate Letter' : 'Generate Cover Letter'}
          </button>
        </div>

        {/* Right Output */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 min-h-[500px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-slate-800">
                  {companyName} — {jobTitle}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {tone}
                </span>
              </div>

              {generatedLetter && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Download text file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-500">Drafting tailored narrative using your verified resume credentials...</p>
              </div>
            ) : generatedLetter ? (
              <textarea
                rows={16}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed text-slate-800 focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <Mail className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">Click "Generate Cover Letter" to produce a role-tailored draft.</p>
              </div>
            )}
          </div>

          {generatedLetter && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Word Count: ~{generatedLetter.split(/\s+/).filter(Boolean).length} words</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Letter
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.txt)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
