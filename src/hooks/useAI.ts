import { useState } from 'react';
import { callAI, AIProvider } from '../lib/ai';
import { useSettings } from './useSettings';

export function useAI() {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiKey = (): { provider: AIProvider; key: string } | null => {
    if (settings.preferredAI === 'claude' && settings.claudeApiKey) {
      return { provider: 'claude', key: settings.claudeApiKey };
    }
    if (settings.preferredAI === 'openai' && settings.openaiApiKey) {
      return { provider: 'openai', key: settings.openaiApiKey };
    }
    if (settings.claudeApiKey) {
      return { provider: 'claude', key: settings.claudeApiKey };
    }
    if (settings.openaiApiKey) {
      return { provider: 'openai', key: settings.openaiApiKey };
    }
    return null;
  };

  const generate = async (
    prompt: string,
    systemPrompt?: string
  ): Promise<string | null> => {
    const config = getApiKey();
    if (!config) {
      setError('No API key configured. Please add one in Settings.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await callAI(config.provider, config.key, prompt, systemPrompt);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateJSON = async <T>(
    prompt: string,
    systemPrompt?: string
  ): Promise<T | null> => {
    const result = await generate(prompt, systemPrompt);
    if (!result) return null;

    try {
      // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
      let cleaned = result.trim();
      if (cleaned.startsWith('```')) {
        // Remove opening fence (with optional language identifier)
        cleaned = cleaned.replace(/^```\w*\n?/, '');
        // Remove closing fence
        cleaned = cleaned.replace(/\n?```$/, '');
      }

      // Try to parse directly first
      try {
        return JSON.parse(cleaned);
      } catch {
        // Fall back to regex extraction
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return JSON.parse(result);
    } catch {
      setError('Failed to parse AI response as JSON');
      return null;
    }
  };

  return {
    generate,
    generateJSON,
    isLoading,
    error,
    clearError: () => setError(null),
    hasApiKey: !!getApiKey()
  };
}
