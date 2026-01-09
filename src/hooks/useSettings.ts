import { useLiveQuery } from 'dexie-react-hooks';
import { db, Settings } from '../lib/db';
import { encryptApiKey, decryptApiKey } from '../lib/crypto';

const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  preferredAI: 'claude',
  onboardingComplete: false
};

export function useSettings() {
  // useLiveQuery returns undefined while loading, then the result (or undefined if not found)
  // We convert "not found" to null so we can distinguish: undefined=loading, null=not found
  const result = useLiveQuery(
    async () => {
      const settings = await db.settings.get('settings');
      if (!settings) return null;

      // Decrypt API keys when loading
      return {
        ...settings,
        claudeApiKey: settings.claudeApiKey
          ? await decryptApiKey(settings.claudeApiKey)
          : undefined,
        openaiApiKey: settings.openaiApiKey
          ? await decryptApiKey(settings.openaiApiKey)
          : undefined,
      };
    },
    []
  );

  // undefined = still loading, null or Settings = query complete
  const isLoading = result === undefined;
  const settings = result ?? DEFAULT_SETTINGS;

  const updateSettings = async (updates: Partial<Omit<Settings, 'id'>>) => {
    const current = await db.settings.get('settings') || DEFAULT_SETTINGS;

    // Encrypt API keys before storing
    const encryptedUpdates = { ...updates };
    if (updates.claudeApiKey !== undefined) {
      encryptedUpdates.claudeApiKey = await encryptApiKey(updates.claudeApiKey);
    }
    if (updates.openaiApiKey !== undefined) {
      encryptedUpdates.openaiApiKey = await encryptApiKey(updates.openaiApiKey);
    }

    await db.settings.put({ ...current, ...encryptedUpdates });
  };

  const initSettings = async () => {
    const existing = await db.settings.get('settings');
    if (!existing) {
      await db.settings.put(DEFAULT_SETTINGS);
    }
  };

  const hasApiKey = (): boolean => {
    return !!(settings.claudeApiKey || settings.openaiApiKey);
  };

  return {
    settings,
    updateSettings,
    initSettings,
    hasApiKey,
    isLoading
  };
}
