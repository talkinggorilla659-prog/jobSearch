import { useState } from 'react';
import { Button, Input, Card, CardContent } from '../UI';
import { testApiKey } from '../../lib/ai';

interface ApiKeySetupProps {
  onComplete: (keys: { claudeKey?: string; openaiKey?: string }) => void;
  onBack: () => void;
}

export function ApiKeySetup({ onComplete, onBack }: ApiKeySetupProps) {
  const [claudeKey, setClaudeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [testingClaude, setTestingClaude] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);
  const [claudeStatus, setClaudeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTestClaude = async () => {
    if (!claudeKey.trim()) return;
    setTestingClaude(true);
    setClaudeStatus('idle');
    const success = await testApiKey('claude', claudeKey.trim());
    setClaudeStatus(success ? 'success' : 'error');
    setTestingClaude(false);
  };

  const handleTestOpenai = async () => {
    if (!openaiKey.trim()) return;
    setTestingOpenai(true);
    setOpenaiStatus('idle');
    const success = await testApiKey('openai', openaiKey.trim());
    setOpenaiStatus(success ? 'success' : 'error');
    setTestingOpenai(false);
  };

  const handleComplete = () => {
    onComplete({
      claudeKey: claudeKey.trim() || undefined,
      openaiKey: openaiKey.trim() || undefined
    });
  };

  const hasAtLeastOneKey = claudeKey.trim() || openaiKey.trim();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Up AI Access
        </h2>
        <p className="text-gray-600">
          JobHunt uses your own AI API key (BYOK - Bring Your Own Key).
          You only need one key - Claude or OpenAI.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-1">Why BYOK?</h3>
        <p className="text-sm text-blue-800">
          Your API key is stored locally in your browser and sent directly to the AI provider.
          We never see or store your key. This keeps the app free and your data private.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Claude API Key</h3>
                <p className="text-sm text-gray-500">
                  Get your key at{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                Recommended
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                value={claudeKey}
                onChange={(e) => {
                  setClaudeKey(e.target.value);
                  setClaudeStatus('idle');
                }}
                placeholder="sk-ant-..."
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleTestClaude}
                disabled={!claudeKey.trim() || testingClaude}
                isLoading={testingClaude}
              >
                Test
              </Button>
            </div>
            {claudeStatus === 'success' && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Key is valid
              </p>
            )}
            {claudeStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">
                Invalid key. Please check and try again.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-3 text-sm text-gray-500">or</span>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="mb-3">
              <h3 className="font-medium text-gray-900">OpenAI API Key</h3>
              <p className="text-sm text-gray-500">
                Get your key at{' '}
                <a
                  href="https://platform.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                value={openaiKey}
                onChange={(e) => {
                  setOpenaiKey(e.target.value);
                  setOpenaiStatus('idle');
                }}
                placeholder="sk-..."
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleTestOpenai}
                disabled={!openaiKey.trim() || testingOpenai}
                isLoading={testingOpenai}
              >
                Test
              </Button>
            </div>
            {openaiStatus === 'success' && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Key is valid
              </p>
            )}
            {openaiStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">
                Invalid key. Please check and try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-1">Estimated Costs</h3>
        <p className="text-sm text-gray-600">
          You pay the AI provider directly for usage:
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>~$0.02-0.05 per job analysis</li>
          <li>~$0.03-0.10 per resume tailoring</li>
          <li>~$0.02-0.05 per cover letter</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          A full job search typically costs $5-20 total.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!hasAtLeastOneKey}
          className="flex-1"
        >
          Complete Setup
        </Button>
      </div>

      {!hasAtLeastOneKey && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Please add at least one API key to continue
        </p>
      )}
    </div>
  );
}
