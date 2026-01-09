import { useState, useEffect, useRef, useMemo } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Button, Input, Textarea, Card, CardContent, Modal, ResumePreview } from '../UI';
import { extractTextFromPdf } from '../../lib/pdf';

export function ProfileSettings() {
  const { profile, saveProfile, clearProfile, isLoading } = useProfile();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resumeTab, setResumeTab] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name || '');
  const [rawResume, setRawResume] = useState(profile?.rawResume || '');
  const [currentTitle, setCurrentTitle] = useState(profile?.currentTitle || '');
  const [yearsExperience, setYearsExperience] = useState(profile?.yearsExperience || 0);
  const [education, setEducation] = useState(profile?.education || '');
  const [workHistory, setWorkHistory] = useState(profile?.workHistory || '');
  const [skillsText, setSkillsText] = useState(profile?.skills.join(', ') || '');
  const [saved, setSaved] = useState(false);

  // Track unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!profile) return false;
    return (
      name !== profile.name ||
      currentTitle !== profile.currentTitle ||
      yearsExperience !== profile.yearsExperience ||
      education !== profile.education ||
      workHistory !== profile.workHistory ||
      skillsText !== profile.skills.join(', ') ||
      rawResume !== profile.rawResume
    );
  }, [name, currentTitle, yearsExperience, education, workHistory, skillsText, rawResume, profile]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCurrentTitle(profile.currentTitle);
      setYearsExperience(profile.yearsExperience);
      setEducation(profile.education);
      setWorkHistory(profile.workHistory);
      setSkillsText(profile.skills.join(', '));
      setRawResume(profile.rawResume);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    await saveProfile({
      name,
      currentTitle,
      yearsExperience,
      education,
      workHistory,
      skills,
      rawResume,
      updatedAt: new Date().toISOString()
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearProfile = async () => {
    await clearProfile();
    setShowClearModal(false);
    window.location.href = '/';
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setPdfError('Could not extract enough text from this PDF. Try a different file or paste manually.');
      } else {
        setRawResume(text);
        setShowResumeEditor(true);
        setPdfError(null);
      }
    } catch {
      setPdfError('Failed to parse this PDF. Try a different file or paste manually.');
    } finally {
      setIsPdfLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">No profile set up yet.</p>
          <Button onClick={() => (window.location.href = '/')}>
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">You have unsaved changes.</p>
        </div>
      )}
      <Card>
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Current/Recent Job Title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
          />

          <Input
            label="Years of Experience"
            type="number"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
          />

          <Input
            label="Education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />

          <Textarea
            label="Work History Summary"
            value={workHistory}
            onChange={(e) => setWorkHistory(e.target.value)}
            rows={3}
          />

          <Input
            label="Skills (comma-separated)"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="JavaScript, React, Project Management..."
          />

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Your Resume</h3>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePdfUpload}
                accept=".pdf"
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPdfLoading}
              >
                {isPdfLoading ? 'Parsing PDF...' : 'Upload PDF'}
              </Button>
              <button
                onClick={() => setShowResumeEditor(!showResumeEditor)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showResumeEditor ? 'Hide' : 'View/Edit'}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            This is the original resume text used to generate tailored resumes for job applications.
          </p>
          {pdfError && (
            <p className="text-sm text-amber-600 mb-4">{pdfError}</p>
          )}

          {showResumeEditor && (
            <>
              <div className="flex rounded-lg bg-gray-100 p-1 mb-3 w-fit">
                <button
                  onClick={() => setResumeTab('edit')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    resumeTab === 'edit'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setResumeTab('preview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    resumeTab === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>

              {resumeTab === 'edit' ? (
                <Textarea
                  value={rawResume}
                  onChange={(e) => setRawResume(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="Paste your resume text here..."
                />
              ) : (
                <ResumePreview text={rawResume} className="min-h-[300px] max-h-[500px]" />
              )}

              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Note:</span> Changes to your resume will affect all future
                  tailored resume generations. Existing generated resumes won't change.
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={handleSave}>
                  {saved ? 'Saved!' : 'Save Resume'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-2">Reset Profile</h3>
          <p className="text-sm text-gray-500 mb-4">
            Clear your profile and start the setup process again.
          </p>
          <Button variant="danger" onClick={() => setShowClearModal(true)}>
            Clear Profile
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Profile"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to clear your profile? You'll need to go through
          the setup process again.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearProfile}>
            Clear Profile
          </Button>
        </div>
      </Modal>
    </div>
  );
}
