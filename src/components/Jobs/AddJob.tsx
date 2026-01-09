import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Card, CardContent, LoadingOverlay } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { JobAnalysis as JobAnalysisType } from '../../types';
import { JobAnalysis } from './JobAnalysis';

export function AddJob() {
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const { profile } = useProfile();
  const { generateJSON, isLoading, error } = useAI();

  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysisType | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !profile) return;

    const result = await generateJSON<JobAnalysisType>(
      PROMPTS.analyzeJob(
        {
          currentTitle: profile.currentTitle,
          yearsExperience: profile.yearsExperience,
          skills: profile.skills,
          workHistory: profile.workHistory
        },
        jobDescription
      )
    );

    if (result) {
      setAnalysis(result);

      // Save the job to database
      const id = await addJob({
        title: result.title || 'Untitled Position',
        company: result.company || 'Unknown Company',
        url: jobUrl || undefined,
        description: jobDescription,
        status: 'saved',
        matchScore: result.matchScore,
        analysis: {
          strengths: result.strengths,
          gaps: result.gaps,
          keywords: result.keywords,
          requirements: result.requirements
        }
      });

      setJobId(id);
    }
  };

  const handleSaveAndReturn = () => {
    navigate('/');
  };

  const handleGenerateResume = () => {
    if (jobId) {
      navigate(`/job/${jobId}/resume`);
    }
  };

  const handleGenerateCoverLetter = () => {
    if (jobId) {
      navigate(`/job/${jobId}/cover-letter`);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Analyzing job posting..." />;
  }

  if (analysis && jobId) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <JobAnalysis
          analysis={analysis}
          onGenerateResume={handleGenerateResume}
          onGenerateCoverLetter={handleGenerateCoverLetter}
          onSave={handleSaveAndReturn}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Job</h1>
      <p className="text-gray-600 mb-6">
        Paste a job description to analyze how well you match
      </p>

      <Card>
        <CardContent className="space-y-4">
          <Textarea
            label="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job posting here including:

• Job title and company name
• Responsibilities and duties
• Required qualifications and skills
• Preferred/nice-to-have qualifications
• Any other relevant details

The more complete the job description, the better the analysis will be."
            rows={12}
          />
          <p className="text-xs text-gray-500 -mt-3">
            Include the full job posting for the best match analysis and tailored materials.
          </p>

          <Input
            label="Job URL (optional)"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={jobDescription.trim().length < 50}
              className="flex-1"
            >
              Analyze Job
            </Button>
          </div>

          {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
            <p className="text-xs text-gray-500 text-center">
              Please paste more of the job description (at least 50 characters)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
