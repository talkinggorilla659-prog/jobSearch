import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { Button, Input, Card, CardContent } from '../UI';
import { testApiKey } from '../../lib/ai';
import { maskApiKey } from '../../utils/format';

export function ApiKeySettings() {
  const { settings, updateSettings } = useSettings();

  const [claudeKey, setClaudeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [testingClaude, setTestingClaude] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);
  const [claudeStatus, setClaudeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Track unsaved API keys
  const hasUnsavedChanges = useMemo(() => {
    return claudeKey.length > 0 || openaiKey.length > 0;
  }, [claudeKey, openaiKey]);

  // Warn before leaving with unsaved keys
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

  const handleTestClaude = async () => {
    const key = claudeKey || settings.claudeApiKey;
    if (!key) return;
    setTestingClaude(true);
    setClaudeStatus('idle');
    const success = await testApiKey('claude', key);
    setClaudeStatus(success ? 'success' : 'error');
    setTestingClaude(false);
  };

  const handleTestOpenai = async () => {
    const key = openaiKey || settings.openaiApiKey;
    if (!key) return;
    setTestingOpenai(true);
    setOpenaiStatus('idle');
    const success = await testApiKey('openai', key);
    setOpenaiStatus(success ? 'success' : 'error');
    setTestingOpenai(false);
  };

  const handleSaveClaude = async () => {
    await updateSettings({ claudeApiKey: claudeKey });
    setClaudeKey('');
    setClaudeStatus('idle');
  };

  const handleSaveOpenai = async () => {
    await updateSettings({ openaiApiKey: openaiKey });
    setOpenaiKey('');
    setOpenaiStatus('idle');
  };

  const handleRemoveClaude = async () => {
    await updateSettings({ claudeApiKey: undefined });
    setClaudeStatus('idle');
  };

  const handleRemoveOpenai = async () => {
    await updateSettings({ openaiApiKey: undefined });
    setOpenaiStatus('idle');
  };

  const handlePreferredChange = async (provider: 'claude' | 'openai') => {
    await updateSettings({ preferredAI: provider });
  };

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">You have unsaved API key changes. Test and save your key before leaving.</p>
        </div>
      )}
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
            {settings.claudeApiKey && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                Configured
              </span>
            )}
          </div>

          {settings.claudeApiKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm">
                  {showClaudeKey ? settings.claudeApiKey : maskApiKey(settings.claudeApiKey)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                >
                  {showClaudeKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestClaude}
                  isLoading={testingClaude}
                >
                  Test Key
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveClaude}>
                  Remove
                </Button>
              </div>
              {claudeStatus === 'success' && (
                <p className="text-sm text-green-600">Key is valid</p>
              )}
              {claudeStatus === 'error' && (
                <p className="text-sm text-red-600">Key is invalid</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleTestClaude}
                  disabled={!claudeKey}
                  isLoading={testingClaude}
                >
                  Test
                </Button>
              </div>
              {claudeKey && (
                <Button onClick={handleSaveClaude} disabled={claudeStatus !== 'success'}>
                  Save Key
                </Button>
              )}
              {claudeStatus === 'success' && (
                <p className="text-sm text-green-600">Key is valid - click Save to store it</p>
              )}
              {claudeStatus === 'error' && (
                <p className="text-sm text-red-600">Key is invalid</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-start justify-between mb-3">
            <div>
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
            {settings.openaiApiKey && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                Configured
              </span>
            )}
          </div>

          {settings.openaiApiKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm">
                  {showOpenaiKey ? settings.openaiApiKey : maskApiKey(settings.openaiApiKey)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestOpenai}
                  isLoading={testingOpenai}
                >
                  Test Key
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveOpenai}>
                  Remove
                </Button>
              </div>
              {openaiStatus === 'success' && (
                <p className="text-sm text-green-600">Key is valid</p>
              )}
              {openaiStatus === 'error' && (
                <p className="text-sm text-red-600">Key is invalid</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleTestOpenai}
                  disabled={!openaiKey}
                  isLoading={testingOpenai}
                >
                  Test
                </Button>
              </div>
              {openaiKey && (
                <Button onClick={handleSaveOpenai} disabled={openaiStatus !== 'success'}>
                  Save Key
                </Button>
              )}
              {openaiStatus === 'success' && (
                <p className="text-sm text-green-600">Key is valid - click Save to store it</p>
              )}
              {openaiStatus === 'error' && (
                <p className="text-sm text-red-600">Key is invalid</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(settings.claudeApiKey && settings.openaiApiKey) && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-gray-900 mb-3">Preferred AI Provider</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handlePreferredChange('claude')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  settings.preferredAI === 'claude'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Claude</p>
                <p className="text-xs text-gray-500">Anthropic</p>
              </button>
              <button
                onClick={() => handlePreferredChange('openai')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  settings.preferredAI === 'openai'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">GPT-4o</p>
                <p className="text-xs text-gray-500">OpenAI</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-1">Security Note</h3>
        <p className="text-sm text-blue-800">
          Your API keys are stored locally in your browser's IndexedDB. They are never
          sent to any server except the official AI provider APIs when you use AI features.
        </p>
      </div>
    </div>
  );
}
