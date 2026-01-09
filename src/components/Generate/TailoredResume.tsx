import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button, Card, CardContent, LoadingOverlay, ResumePreview } from '../UI';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { Job } from '../../lib/db';
import { generateResumeDocxFromMarkdown, downloadBlob, copyToClipboard } from '../../lib/docx';
import type { TemplateType } from '../../lib/resume-pdf';
import { TEMPLATE_OPTIONS } from '../../lib/resume-pdf';

export function TailoredResume() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const { profile } = useProfile();
  const { generate, isLoading, error } = useAI();

  const [job, setJob] = useState<Job | null>(null);
  const [resume, setResume] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType>('modern');

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
        if (jobData.tailoredResume) {
          setResume(jobData.tailoredResume);
        }
      }
      setIsPageLoading(false);
    };
    loadJob();
  }, [id]);

  const handleGenerate = async () => {
    if (!job || !profile) return;

    const keywords = job.analysis?.keywords || [];
    const result = await generate(
      PROMPTS.tailorResume(profile.rawResume, job.description, keywords)
    );

    if (result) {
      setResume(result);
      await updateJob(job.id, { tailoredResume: result });
    }
  };

  const handleGenerateWithOptimization = async () => {
    if (!job || !profile || !job.resumeOptimization) return;

    // Use existing tailored resume if available, otherwise fall back to original
    const baseResume = resume || job.tailoredResume || profile.rawResume;

    const result = await generate(
      PROMPTS.tailorResumeWithOptimization(baseResume, job.description, {
        missingKeywords: job.resumeOptimization.missingKeywords,
        keywordComparison: job.resumeOptimization.keywordComparison,
        placementSuggestions: job.resumeOptimization.placementSuggestions
      })
    );

    if (result) {
      setResume(result);
      await updateJob(job.id, { tailoredResume: result });
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    if (!job || !resume) return;

    setIsDocxLoading(true);
    setDownloadError(null);

    try {
      const blob = await generateResumeDocxFromMarkdown(resume, previewTemplate);
      const filename = `Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.docx`;
      downloadBlob(blob, filename);
    } catch {
      setDownloadError('Failed to generate DOCX. Please try again.');
    } finally {
      setIsDocxLoading(false);
    }
  };

  const handleSave = async () => {
    if (!job) return;
    await updateJob(job.id, { tailoredResume: resume });
  };

  const handleDownloadPdf = async () => {
    if (!job || !resume) return;

    setIsPdfLoading(true);
    setDownloadError(null);

    try {
      // Use @react-pdf/renderer for proper PDF generation
      const { generateResumePDF } = await import('../../lib/resume-pdf');
      const blob = await generateResumePDF(resume, previewTemplate);
      const filename = `Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.pdf`;
      downloadBlob(blob, filename);
    } catch {
      setDownloadError('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Tailored Resume</h1>
        <p className="text-gray-600">
          {job.title} at {job.company}
        </p>
      </div>

      {!resume && !isLoading && (
        <div className="space-y-4">
          {!job.resumeOptimization && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    For best results, run Resume Optimization first
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Resume Optimization analyzes keyword gaps between your resume and the job posting,
                    giving you specific suggestions that result in a much better tailored resume.
                  </p>
                  <button
                    onClick={() => navigate(`/job/${job.id}/resume-optimization`)}
                    className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                  >
                    Run Resume Optimization
                  </button>
                </div>
              </div>
            </div>
          )}

          {job.resumeOptimization && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Optimization insights ready
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your resume will be generated using {job.resumeOptimization.missingKeywords.length} missing keywords
                    and {job.resumeOptimization.placementSuggestions.length} placement suggestions from your optimization analysis.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-medium text-gray-900 mb-2">
                Generate a Tailored Resume
              </h3>
              <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                We'll create a version of your resume optimized for this specific job,
                incorporating relevant keywords and highlighting matching experience.
              </p>
              {job.resumeOptimization ? (
                <Button onClick={handleGenerateWithOptimization}>
                  Generate Resume with Optimization
                </Button>
              ) : (
                <Button onClick={handleGenerate}>
                  Generate Resume
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <LoadingOverlay message="Generating tailored resume..." />
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

      {downloadError && (
        <Card className="mb-4">
          <CardContent>
            <p className="text-red-600">{downloadError}</p>
          </CardContent>
        </Card>
      )}

      {resume && !isLoading && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex rounded-lg bg-gray-100 p-1 w-fit">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'edit'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Edit
                  </button>
                </div>

                {viewMode === 'preview' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Template:</label>
                    <select
                      value={previewTemplate}
                      onChange={(e) => setPreviewTemplate(e.target.value as TemplateType)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                    >
                      {TEMPLATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {viewMode === 'edit' ? (
                <div data-color-mode="light">
                  <MDEditor
                    value={resume}
                    onChange={(value) => setResume(value || '')}
                    height={500}
                    preview="edit"
                  />
                </div>
              ) : (
                <ResumePreview text={resume} template={previewTemplate} className="min-h-[400px] max-h-[600px]" />
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
            <Button
              onClick={handleDownloadDocx}
              variant="secondary"
              disabled={isDocxLoading}
            >
              {isDocxLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating DOCX...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download DOCX
                </>
              )}
            </Button>

            <Button
              onClick={handleDownloadPdf}
              variant="secondary"
              disabled={isPdfLoading}
            >
              {isPdfLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </Button>

            <Button onClick={handleSave} variant="ghost">
              Save Changes
            </Button>
            <Button onClick={handleGenerate} variant="ghost">
              Regenerate
            </Button>
            {job.resumeOptimization && (
              <Button onClick={handleGenerateWithOptimization} variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Regenerate with Optimization
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            <span className="font-medium">Regenerate</span> starts fresh from your original resume.
            {job.resumeOptimization && (
              <> <span className="font-medium">Regenerate with Optimization</span> refines your current tailored resume using optimization insights.</>
            )}
          </p>

          {job.resumeOptimization && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Optimization insights available!</span>{' '}
                Use "Regenerate with Optimization" to create a resume that incorporates{' '}
                {job.resumeOptimization.missingKeywords.length} missing keywords and{' '}
                {job.resumeOptimization.placementSuggestions.length} placement suggestions.
              </p>
            </div>
          )}

          {!job.resumeOptimization && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Tip:</span>{' '}
                Run{' '}
                <button
                  onClick={() => navigate(`/job/${job.id}/resume-optimization`)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Resume Optimization
                </button>{' '}
                first to get detailed keyword analysis, then regenerate for better results.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
