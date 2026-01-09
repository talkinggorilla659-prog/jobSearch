export type { UserProfile, Job, Settings } from '../lib/db';

export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface JobAnalysis {
  title: string;
  company: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  requirements: string[];
  keywords: string[];
}

export interface ExtractedProfile {
  name: string;
  currentTitle: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  workHistory: string;
}

export interface InterviewQuestion {
  question: string;
  whyAsked: string;
  guidance: string;
}
