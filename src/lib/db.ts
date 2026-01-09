import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  id: string;
  name: string;
  currentTitle: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  workHistory: string;
  rawResume: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  url?: string;
  description: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  matchScore?: number;
  analysis?: {
    strengths: string[];
    gaps: string[];
    keywords: string[];
    requirements: string[];
  };
  tailoredResume?: string;
  coverLetter?: string;
  interviewQuestions?: Array<{
    question: string;
    whyAsked: string;
    guidance: string;
  }>;
  resumeOptimization?: {
    missingKeywords: string[];
    keywordComparison: Array<{
      keyword: string;
      inJob: number;
      inResume: number;
      priority: 'high' | 'medium' | 'low';
    }>;
    placementSuggestions: Array<{
      keyword: string;
      section: string;
      suggestion: string;
    }>;
    formattingTips: string[];
    overallScore: number;
    summary: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    date: string;
  }>;
}

export interface Settings {
  id: string;
  claudeApiKey?: string;
  openaiApiKey?: string;
  preferredAI: 'claude' | 'openai';
  onboardingComplete: boolean;
}

export class JobHuntDB extends Dexie {
  profile!: Table<UserProfile>;
  jobs!: Table<Job>;
  settings!: Table<Settings>;

  constructor() {
    super('JobHuntDB');
    this.version(1).stores({
      profile: 'id',
      jobs: 'id, status, createdAt, matchScore',
      settings: 'id'
    });
  }
}

export const db = new JobHuntDB();
