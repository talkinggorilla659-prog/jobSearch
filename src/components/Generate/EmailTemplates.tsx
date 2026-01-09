import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Textarea, LoadingOverlay, EmailPreview } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { Job } from '../../lib/db';
import { copyToClipboard } from '../../lib/docx';

type EmailType = 'thank-you' | 'follow-up' | 'check-in';

const EMAIL_TYPES: { id: EmailType; label: string; description: string }[] = [
  {
    id: 'thank-you',
    label: 'Thank You',
    description: 'Send after an interview to thank the interviewer'
  },
  {
    id: 'follow-up',
    label: 'Follow Up',
    description: 'Send 1-2 weeks after applying when you haven\'t heard back'
  },
  {
    id: 'check-in',
    label: 'Check In',
    description: 'Send to check on status after interviewing'
  }
];

export function EmailTemplates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob } = useJobs();
  const { profile } = useProfile();
  const { generate, isLoading, error } = useAI();

  const [job, setJob] = useState<Job | null>(null);
  const [emailType, setEmailType] = useState<EmailType>('thank-you');
  const [context, setContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
      }
      setIsPageLoading(false);
    };
    loadJob();
  }, [id]);

  const handleGenerate = async () => {
    if (!job || !profile) return;

    const prompt = PROMPTS.generateFollowUpEmail(
      emailType,
      {
        name: profile.name,
        currentTitle: profile.currentTitle
      },
      {
        title: job.title,
        company: job.company
      },
      context || undefined
    );

    const result = await generate(prompt);

    if (result) {
      setGeneratedEmail(result);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setGeneratedEmail('');
    setContext('');
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
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600">
          {job.title} at {job.company}
        </p>
      </div>

      {!generatedEmail && !isLoading && (
        <div className="space-y-6">
          <Card>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-4">Select Email Type</h3>
              <div className="space-y-3">
                {EMAIL_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      emailType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailType"
                      value={type.id}
                      checked={emailType === type.id}
                      onChange={(e) => setEmailType(e.target.value as EmailType)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-2">
                Additional Context (Optional)
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {emailType === 'thank-you'
                  ? 'Add notes about your interview conversation to personalize the email'
                  : emailType === 'follow-up'
                  ? 'Add any specific details about your application'
                  : 'Add any context about your interview or the timeline discussed'}
              </p>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Discussed the new product launch, interviewer mentioned team expansion plans..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} className="w-full">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Generate {EMAIL_TYPES.find((t) => t.id === emailType)?.label} Email
          </Button>
        </div>
      )}

      {isLoading && (
        <LoadingOverlay message="Writing your email..." />
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

      {generatedEmail && !isLoading && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {EMAIL_TYPES.find((t) => t.id === emailType)?.label} Email
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('edit')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'edit'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'edit' ? (
                <Textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  rows={14}
                  className="text-sm font-mono"
                />
              ) : (
                <EmailPreview text={generatedEmail} className="min-h-[300px] max-h-[400px]" />
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy}>
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button onClick={handleGenerate} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </Button>
            <Button onClick={handleClear} variant="ghost">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Start Over
            </Button>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent>
              <h4 className="font-medium text-blue-900 mb-1">Tips for Sending</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {emailType === 'thank-you' && (
                  <>
                    <li>Send within 24 hours of your interview</li>
                    <li>Personalize for each interviewer if you met multiple people</li>
                    <li>Keep the subject line professional and clear</li>
                  </>
                )}
                {emailType === 'follow-up' && (
                  <>
                    <li>Wait at least one week after applying before following up</li>
                    <li>Send on Tuesday, Wednesday, or Thursday morning</li>
                    <li>Be patient - hiring processes take time</li>
                  </>
                )}
                {emailType === 'check-in' && (
                  <>
                    <li>Reference any timeline they mentioned during interviews</li>
                    <li>Keep it brief and professional</li>
                    <li>Don't send more than once a week</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
