import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, LoadingOverlay } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { Job } from '../../lib/db';
import { InterviewQuestion } from '../../types';

export function InterviewPrep() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const { profile } = useProfile();
  const { generateJSON, isLoading, error } = useAI();

  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
        if (jobData.interviewQuestions) {
          setQuestions(jobData.interviewQuestions);
        }
      }
      setIsPageLoading(false);
    };
    loadJob();
  }, [id]);

  const handleGenerate = async () => {
    if (!job || !profile) return;

    const result = await generateJSON<InterviewQuestion[]>(
      PROMPTS.generateInterviewQuestions(
        {
          currentTitle: profile.currentTitle,
          yearsExperience: profile.yearsExperience,
          skills: profile.skills
        },
        {
          title: job.title,
          company: job.company,
          description: job.description
        }
      )
    );

    if (result && Array.isArray(result)) {
      setQuestions(result);
      await updateJob(job.id, { interviewQuestions: result });
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
        <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
        <p className="text-gray-600">
          {job.title} at {job.company}
        </p>
      </div>

      {questions.length === 0 && !isLoading && (
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-medium text-gray-900 mb-2">
              Generate Interview Questions
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              We'll generate likely interview questions specific to this role,
              along with guidance on how to approach each one.
            </p>
            <Button onClick={handleGenerate}>
              Generate Questions
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <LoadingOverlay message="Preparing interview questions..." />
      )}

      {error && (
        <Card className="mb-4">
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={handleGenerate} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {questions.length} questions prepared
            </p>
            <Button onClick={handleGenerate} variant="ghost" size="sm">
              Generate More
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {q.question}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {expandedIndex === index && (
                    <div className="px-4 pb-4 pt-0 ml-9">
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Why they ask this
                        </p>
                        <p className="text-sm text-gray-700">{q.whyAsked}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          How to approach it
                        </p>
                        <p className="text-sm text-gray-700">{q.guidance}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Tips for Success</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>- Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
              <li>- Prepare specific examples from your experience</li>
              <li>- Practice your answers out loud</li>
              <li>- Have questions ready to ask the interviewer</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
