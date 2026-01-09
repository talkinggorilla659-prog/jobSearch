import { useState } from 'react';
import { Welcome } from './Welcome';
import { ResumeUpload } from './ResumeUpload';
import { ProfileConfirm } from './ProfileConfirm';
import { ApiKeySetup } from './ApiKeySetup';
import { useProfile } from '../../hooks/useProfile';
import { useSettings } from '../../hooks/useSettings';
import { useAI } from '../../hooks/useAI';
import { PROMPTS } from '../../lib/prompts';
import { ExtractedProfile } from '../../types';

type Step = 'welcome' | 'apikeys' | 'resume' | 'profile';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [rawResume, setRawResume] = useState('');
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const { saveProfile } = useProfile();
  const { updateSettings } = useSettings();
  const { generateJSON } = useAI();

  const handleResumeSubmit = async (resumeText: string) => {
    setRawResume(resumeText);
    setIsExtracting(true);
    setExtractError(null);

    try {
      const profile = await generateJSON<ExtractedProfile>(
        PROMPTS.extractProfile(resumeText)
      );

      if (profile) {
        setExtractedProfile(profile);
        setStep('profile');
      } else {
        // If AI extraction fails, create a basic profile for manual entry
        setExtractedProfile({
          name: '',
          currentTitle: '',
          yearsExperience: 0,
          skills: [],
          education: '',
          workHistory: ''
        });
        setStep('profile');
      }
    } catch {
      setExtractError('Failed to analyze resume. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApiKeysSaved = async (keys: { claudeKey?: string; openaiKey?: string }) => {
    await updateSettings({
      claudeApiKey: keys.claudeKey,
      openaiApiKey: keys.openaiKey,
      preferredAI: keys.claudeKey ? 'claude' : 'openai'
    });
    setStep('resume');
  };

  const handleProfileConfirm = async (profile: ExtractedProfile) => {
    await saveProfile({
      ...profile,
      rawResume,
      updatedAt: new Date().toISOString()
    });
    await updateSettings({ onboardingComplete: true });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['welcome', 'apikeys', 'resume', 'profile'] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : (['welcome', 'apikeys', 'resume', 'profile'] as const).indexOf(step) > i
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-8 h-0.5 ${
                    (['welcome', 'apikeys', 'resume', 'profile'] as const).indexOf(step) > i
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 'welcome' && (
        <Welcome onContinue={() => setStep('apikeys')} />
      )}

      {step === 'apikeys' && (
        <ApiKeySetup
          onComplete={handleApiKeysSaved}
          onBack={() => setStep('welcome')}
        />
      )}

      {step === 'resume' && (
        <>
          <ResumeUpload
            onSubmit={handleResumeSubmit}
            onBack={() => setStep('apikeys')}
            isLoading={isExtracting}
          />
          {extractError && (
            <p className="max-w-2xl mx-auto px-4 text-sm text-red-600 text-center">
              {extractError}
            </p>
          )}
        </>
      )}

      {step === 'profile' && extractedProfile && (
        <ProfileConfirm
          profile={extractedProfile}
          onConfirm={handleProfileConfirm}
          onBack={() => setStep('resume')}
        />
      )}
    </div>
  );
}
