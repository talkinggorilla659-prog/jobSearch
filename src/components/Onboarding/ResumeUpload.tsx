import { useState, useRef } from 'react';
import { Button, Textarea, ResumePreview } from '../UI';
import { extractTextFromPdf } from '../../lib/pdf';

interface ResumeUploadProps {
  onSubmit: (resumeText: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ResumeUpload({ onSubmit, onBack, isLoading }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file');
      return;
    }

    setIsPdfLoading(true);
    setPdfError(null);

    try {
      const text = await extractTextFromPdf(file);
      if (text.trim().length < 50) {
        setPdfError(
          'Could not extract enough text from this PDF. Please paste your resume text instead.'
        );
      } else {
        setResumeText(text);
      }
    } catch {
      setPdfError(
        'Failed to parse this PDF. Please paste your resume text instead.'
      );
    } finally {
      setIsPdfLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = () => {
    if (resumeText.trim().length < 50) return;
    onSubmit(resumeText.trim());
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          We'll analyze your resume to help match you with jobs and tailor your applications.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Paste your resume text
            </label>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your full resume here..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the most reliable option - just copy and paste from your resume document.
              </p>
            </>
          ) : (
            <ResumePreview text={resumeText} className="min-h-[300px] max-h-[400px]" />
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-3 text-sm text-gray-500">or</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF <span className="text-amber-600">(Beta)</span>
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            {isPdfLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-gray-500">Parsing PDF...</span>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF only</p>
              </>
            )}
          </div>
          {pdfError && (
            <p className="mt-2 text-sm text-amber-600">{pdfError}</p>
          )}
          <p className="mt-2 text-xs text-amber-600">
            PDF parsing may not work perfectly for all formats. If the result looks wrong, please paste your resume text instead.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={resumeText.trim().length < 50 || isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </div>
    </div>
  );
}
