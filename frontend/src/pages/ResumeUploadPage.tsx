import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/common/Toast';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      showToast('Please upload a valid PDF or DOCX file.', 'error');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('File exceeds the 10MB size limit.', 'error');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a resume file first.', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Resume parsed and analyzed successfully!', 'success');
      navigate('/ats-analysis');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to upload and parse resume.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Generate and upload a sample high-quality tech resume for instantaneous testing
  const handleUseSampleResume = async () => {
    setUploading(true);
    try {
      const sampleText = `Alex Rivera
alex.rivera.dev@example.com | +1 (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexriveradev | github.com/alexrivera

PROFESSIONAL SUMMARY
Dynamic Python Backend & Cloud Engineer with 2.5 years of experience designing scalable REST microservices, asynchronous task queues, and automated data pipelines using FastAPI and PostgreSQL. Passionate about system performance and high availability.

TECHNICAL SKILLS
Languages: Python, SQL, JavaScript, TypeScript, Shell
Frameworks & Libraries: FastAPI, Django, Pydantic, SQLAlchemy, PyTest, Celery
Databases & Cloud: PostgreSQL, Redis, Docker, Kubernetes, AWS (S3, EC2), Git, CI/CD

PROFESSIONAL EXPERIENCE
Software Engineer | Apex Cloud Solutions (2022 - Present)
- Engineered scalable backend microservices using FastAPI and PostgreSQL, reducing API endpoint response times by 32% for 450,000+ daily active users.
- Architected asynchronous batch processing workers with Celery and Redis, improving background job throughput by 40%.
- Streamlined deployment workflows by implementing automated GitHub Actions CI/CD pipelines, decreasing release cycle duration from 4 hours to 15 minutes.
- Designed database indexing strategies and connection pooling configurations that resolved query bottlenecks during peak traffic periods.

Junior Developer | ByteCraft Interactive (2021 - 2022)
- Developed and maintained RESTful APIs in Python and integrated third-party payment gateways.
- Wrote over 120 automated unit and integration tests using PyTest, elevating system test coverage to 88%.
- Collaborated across an agile squad of 6 engineers, conducting peer code reviews and architectural planning sessions.

EDUCATION
Bachelor of Science in Computer Science | California State University (2018 - 2021)
GPA: 3.8 / 4.0 | Honors in Distributed Systems

PROJECTS
High-Throughput Task Streamer: Open-source distributed event queue built with Python and Redis Streams, capable of processing 12,000 tasks/second.
`;
      // Create a text file or simulate upload
      const blob = new Blob([sampleText], { type: 'text/plain' });
      // In our backend, we accept PDF and DOCX. Let's create a minimal valid PDF using client-side js or use a clean upload
      // Since fitz parses PDFs, let's create a minimal PDF via basic PDF stream:
      const minimalPdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length ${sampleText.length}>>stream\nBT\n/F1 12 Tf\n100 700 Td\n(${sampleText.replace(/\n/g, '\\n').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n${350 + sampleText.length}\n%%EOF`;

      const sampleFile = new File([minimalPdf], 'Sample_Software_Engineer_Resume.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', sampleFile);

      const resp = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Sample Python Developer resume loaded and audited!', 'success');
      navigate('/ats-analysis');
    } catch (err: any) {
      console.error(err);
      showToast('Error uploading sample resume. You can select your own PDF/DOCX file.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload & Audit Resume</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Upload your resume in PDF or DOCX format. The Resume/ATS Agent will extract your credentials, compute your ATS score, and identify skill match gaps.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        } shadow-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800">
          {file ? file.name : 'Click to upload or drag and drop'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          PDF or DOCX documents up to 10MB
        </p>

        {file && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Ready to parse ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Parsing with Resume / ATS Agent...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Parse & Run ATS Analysis
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleUseSampleResume}
          disabled={uploading}
          className="w-full sm:w-auto py-3.5 px-6 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          Load Verified Sample Resume
        </button>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left">
          <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> PyMuPDF Text Extraction
          </div>
          <p className="text-xs text-slate-500">Robust local PDF parser that extracts clean formatting and sections.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left">
          <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> NLP Skill Extraction
          </div>
          <p className="text-xs text-slate-500">Recognizes 150+ frameworks, databases, cloud, and programming languages.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left">
          <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Zero Data Hallucination
          </div>
          <p className="text-xs text-slate-500">Never invents jobs or credentials you do not possess.</p>
        </div>
      </div>
    </div>
  );
};
