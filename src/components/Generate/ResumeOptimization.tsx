import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, LoadingOverlay } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { Job } from '../../lib/db';

type ResumeOptimizationData = NonNullable<Job['resumeOptimization']>;

export function ResumeOptimization() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const { profile } = useProfile();
  const { generateJSON, isLoading, error } = useAI();

  const [job, setJob] = useState<Job | null>(null);
  const [optimization, setOptimization] = useState<ResumeOptimizationData | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['suggestions']));

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
        if (jobData.resumeOptimization) {
          setOptimization(jobData.resumeOptimization);
        }
      }
      setIsPageLoading(false);
    };
    loadJob();
  }, [id]);

  const resumeToAnalyze = job?.tailoredResume || profile?.rawResume || '';
  const isAnalyzingTailored = !!job?.tailoredResume;

  const handleAnalyze = async () => {
    if (!job || !profile) return;

    const result = await generateJSON<ResumeOptimizationData>(
      PROMPTS.analyzeResumeOptimization(resumeToAnalyze, job.description)
    );

    if (result) {
      setOptimization(result);
      await updateJob(job.id, { resumeOptimization: result });
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100 border-green-200';
    if (score >= 70) return 'bg-blue-100 border-blue-200';
    if (score >= 50) return 'bg-amber-100 border-amber-200';
    return 'bg-red-100 border-red-200';
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-gray-100 text-gray-600'
    };
    return styles[priority];
  };

  const getKeywordStatus = (inJob: number, inResume: number) => {
    if (inResume === 0) return { icon: '❌', text: 'Missing', color: 'text-red-600' };
    if (inResume < inJob) return { icon: '⚠️', text: 'Add more', color: 'text-amber-600' };
    return { icon: '✓', text: 'Good', color: 'text-green-600' };
  };

  if (isPageLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/job/${job.id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Job
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resume Optimization</h1>
        <p className="text-gray-600">
          {job.title} at {job.company}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Analyzing:{' '}
          <span className={isAnalyzingTailored ? 'text-green-600 font-medium' : 'text-gray-600'}>
            {isAnalyzingTailored ? 'Tailored Resume' : 'Original Resume'}
          </span>
        </p>
      </div>

      {!optimization && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="font-medium text-gray-900 mb-2">
              Analyze Resume Optimization
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              We'll compare your resume against this job posting to identify
              missing keywords and suggest improvements for ATS compatibility.
            </p>
            <Button onClick={handleAnalyze}>
              Analyze Resume
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <LoadingOverlay message="Analyzing your resume..." />
      )}

      {error && (
        <Card className="mb-4">
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={handleAnalyze} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {optimization && !isLoading && (
        <div className="space-y-4">
          {/* Score and Summary */}
          <Card className={`border-2 ${getScoreBg(optimization.overallScore)}`}>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Optimization Score</h3>
                  <p className={`text-4xl font-bold ${getScoreColor(optimization.overallScore)}`}>
                    {optimization.overallScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Score Guide</p>
                  <div className="text-xs space-y-0.5">
                    <p className="text-green-600">85+ Excellent</p>
                    <p className="text-blue-600">70-84 Good</p>
                    <p className="text-amber-600">50-69 Needs work</p>
                    <p className="text-red-600">&lt;50 Significant gaps</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{optimization.summary}</p>
            </CardContent>
          </Card>

          {/* Missing Keywords */}
          {optimization.missingKeywords.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {optimization.missingKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keyword Comparison */}
          <Card>
            <CardContent>
              <button
                onClick={() => toggleSection('keywords')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Keyword Comparison
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has('keywords') ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has('keywords') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Keyword</th>
                        <th className="text-center py-2 px-2">In Job</th>
                        <th className="text-center py-2 px-2">In Resume</th>
                        <th className="text-center py-2 px-2">Priority</th>
                        <th className="text-left py-2 pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimization.keywordComparison.map((item, i) => {
                        const status = getKeywordStatus(item.inJob, item.inResume);
                        return (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium">{item.keyword}</td>
                            <td className="text-center py-2 px-2">{item.inJob}x</td>
                            <td className="text-center py-2 px-2">{item.inResume}x</td>
                            <td className="text-center py-2 px-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${getPriorityBadge(item.priority)}`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className={`py-2 pl-4 ${status.color}`}>
                              {status.icon} {status.text}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placement Suggestions */}
          <Card>
            <CardContent>
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Placement Suggestions
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has('suggestions') ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has('suggestions') && (
                <div className="space-y-3">
                  {optimization.placementSuggestions.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {item.section}
                        </span>
                        <span className="font-medium text-gray-900">{item.keyword}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formatting Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent>
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ATS Formatting Tips
              </h3>
              <ul className="space-y-2">
                {optimization.formattingTips.map((tip, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate(`/job/${job.id}/resume`)}>
              Go to Tailored Resume
            </Button>
            <Button onClick={handleAnalyze} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyze
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Note: This analysis provides keyword optimization guidance. Actual ATS scoring
            varies by system and cannot be precisely predicted.
          </p>
        </div>
      )}
    </div>
  );
}
