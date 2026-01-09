import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';
import { useProfile } from './hooks/useProfile';
import { Layout } from './components/Layout';
import { OnboardingFlow } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { AddJob, JobDetail, JobTracker } from './components/Jobs';
import { TailoredResume, CoverLetter, InterviewPrep, EmailTemplates, ResumeOptimization } from './components/Generate';
import { Settings } from './components/Settings';
import { LoadingOverlay } from './components/UI';

function App() {
  const { settings, initSettings, isLoading: settingsLoading } = useSettings();
  const { profile, isLoading: profileLoading } = useProfile();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initSettings();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized || settingsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingOverlay message="Loading..." />
      </div>
    );
  }

  // Show onboarding if not completed
  if (!settings.onboardingComplete || !profile) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/job/:id/resume" element={<TailoredResume />} />
        <Route path="/job/:id/cover-letter" element={<CoverLetter />} />
        <Route path="/job/:id/interview-prep" element={<InterviewPrep />} />
        <Route path="/job/:id/email-templates" element={<EmailTemplates />} />
        <Route path="/job/:id/resume-optimization" element={<ResumeOptimization />} />
        <Route path="/tracker" element={<JobTracker />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
