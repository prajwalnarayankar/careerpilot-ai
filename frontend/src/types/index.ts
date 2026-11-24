export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  user_id: number;
  headline?: string;
  phone?: string;
  location?: string;
  preferred_job_role?: string;
  preferred_location?: string;
  experience_level: string;
  preferred_work_mode: string;
  skills: string[];
  education: Array<{ degree: string; institution: string; year?: string }>;
  bio?: string;
  target_salary?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  target_role?: string;
  target_job_id?: number;
  ats_score: number;
  keyword_match_score: number;
  skills_match_score: number;
  formatting_score: number;
  experience_score: number;
  education_score: number;
  formatting_problems: string[];
  missing_sections: string[];
  measurable_achievements: string[];
  extracted_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  candidate_name?: string;
  contact_info: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  education: Array<{ degree: string; institution: string; year?: string }>;
  experience: Array<{ role: string; company: string; duration?: string; bullets?: string[] }>;
  projects: Array<{ name: string; description?: string; technologies?: string[] }>;
  skills: string[];
  certifications: string[];
  is_primary: number;
  created_at: string;
  updated_at: string;
  latest_analysis?: ResumeAnalysis;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  work_mode: string;
  experience: string;
  salary?: string;
  description: string;
  skills: string[];
  job_url?: string;
  source: string;
  is_demo: boolean;
  created_at: string;
  user_match_score?: number;
  is_saved?: boolean;
  application_status?: string;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  source_used: string;
  is_demo: boolean;
}

export interface JobMatch {
  job_id: number;
  job_title: string;
  company: string;
  resume_id?: number;
  match_score: number;
  skills_match_score: number;
  experience_compatibility: string;
  education_compatibility: string;
  keyword_overlap: number;
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_id?: number;
  status: 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';
  notes?: string;
  salary_offered?: string;
  applied_date?: string;
  follow_up_date?: string;
  interview_date?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface KanbanColumn {
  status: string;
  count: number;
  applications: Application[];
}

export interface CoverLetter {
  id: number;
  user_id: number;
  job_id?: number;
  resume_id?: number;
  company_name: string;
  job_title: string;
  salutation: string;
  content: string;
  tone: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewAnswer {
  id: number;
  question_id: number;
  user_answer: string;
  evaluation_score: number;
  feedback: string;
  improved_answer: string;
  strengths: string[];
  weaknesses: string[];
  key_takeaways: string[];
  submitted_at: string;
}

export interface InterviewQuestion {
  id: number;
  session_id: number;
  category: string;
  question_text: string;
  context_hint?: string;
  sample_key_points: string[];
  order_index: number;
  answer?: InterviewAnswer;
}

export interface InterviewSession {
  id: number;
  user_id: number;
  job_id?: number;
  title: string;
  role_target: string;
  session_type: string;
  overall_score?: number;
  summary_feedback?: string;
  created_at: string;
  completed_at?: string;
  questions: InterviewQuestion[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  count?: number;
  color?: string;
}

export interface DashboardStats {
  total_jobs_found: number;
  saved_jobs_count: number;
  applications_count: number;
  interviews_count: number;
  average_match_score: number;
  latest_ats_score?: number;
  applications_by_status: ChartDataPoint[];
  jobs_by_category: ChartDataPoint[];
  match_score_distribution: ChartDataPoint[];
  application_activity: ChartDataPoint[];
  recommended_jobs: Job[];
  skills_to_improve: string[];
}

export interface CareerInsightCard {
  category: string;
  title: string;
  description: string;
  actionable_steps: string[];
  impact_level: string;
  confidence_score: number;
}

export interface CareerInsights {
  summary: string;
  insights: CareerInsightCard[];
  top_in_demand_skills: Array<{ skill: string; demand_percentage: number; category: string }>;
  target_role_recommendations: string[];
  learning_resources: Array<{ title: string; provider: string; url: string }>;
  disclaimer: string;
}

export interface BulletPointImprovement {
  original: string;
  improved: string;
  impact_factor: string;
  skills_highlighted: string[];
}

export interface ResumeOptimizationResponse {
  resume_id: number;
  target_role?: string;
  optimized_summary: string;
  improved_bullet_points: BulletPointImprovement[];
  recommended_skills: string[];
  keyword_recommendations: string[];
  project_improvements: Array<{ name: string; suggestion: string }>;
  general_tips: string[];
}
