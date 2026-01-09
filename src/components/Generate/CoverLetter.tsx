import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button, Card, CardContent, LoadingOverlay, CoverLetterPreview } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { Job } from '../../lib/db';
import { generateCoverLetterDocx, downloadBlob, copyToClipboard } from '../../lib/docx';

export function CoverLetter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const { profile } = useProfile();
  const { generate, isLoading, error } = useAI();

  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
        if (jobData.coverLetter) {
          setCoverLetter(jobData.coverLetter);
        }
      }
      setIsPageLoading(false);
    };
    loadJob();
  }, [id]);

  const handleGenerate = async () => {
    if (!job || !profile) return;

    const strengths = job.analysis?.strengths || [];
    const result = await generate(
      PROMPTS.generateCoverLetter(
        {
          name: profile.name,
          currentTitle: profile.currentTitle,
          skills: profile.skills,
          workHistory: profile.workHistory
        },
        {
          title: job.title,
          company: job.company,
          description: job.description
        },
        strengths
      )
    );

    if (result) {
      setCoverLetter(result);
      await updateJob(job.id, { coverLetter: result });
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!profile) return;
    const blob = await generateCoverLetterDocx(coverLetter, profile.name);
    const filename = `CoverLetter_${job?.company.replace(/\s+/g, '_')}_${job?.title.replace(/\s+/g, '_')}.docx`;
    downloadBlob(blob, filename);
  };

  const handleSave = async () => {
    if (!job) return;
    await updateJob(job.id, { coverLetter });
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
        <h1 className="text-2xl font-bold text-gray-900">Cover Letter</h1>
        <p className="text-gray-600">
          {job.title} at {job.company}
        </p>
      </div>

      {!coverLetter && !isLoading && (
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-medium text-gray-900 mb-2">
              Generate a Cover Letter
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              We'll create a personalized cover letter that highlights your
              relevant experience and enthusiasm for this role.
            </p>
            <Button onClick={handleGenerate}>
              Generate Cover Letter
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <LoadingOverlay message="Writing your cover letter..." />
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

      {coverLetter && !isLoading && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Cover Letter</span>
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
                <div data-color-mode="light">
                  <MDEditor
                    value={coverLetter}
                    onChange={(value) => setCoverLetter(value || '')}
                    height={400}
                    preview="edit"
                  />
                </div>
              ) : (
                <CoverLetterPreview text={coverLetter} className="min-h-[350px] max-h-[500px]" />
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
            <Button onClick={handleDownload} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download DOCX
            </Button>
            <Button onClick={handleSave} variant="ghost">
              Save Changes
            </Button>
            <Button onClick={handleGenerate} variant="ghost">
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
