import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '../lib/db';

export function useProfile() {
  // useLiveQuery returns undefined while loading, then the result (or undefined if not found)
  // We convert "not found" to null so we can distinguish: undefined=loading, null=not found
  const result = useLiveQuery(
    async () => {
      const profile = await db.profile.get('profile');
      return profile ?? null;
    },
    []
  );

  // undefined = still loading, null = not found, UserProfile = found
  const isLoading = result === undefined;
  const profile = result;

  const saveProfile = async (data: Omit<UserProfile, 'id'>) => {
    await db.profile.put({ id: 'profile', ...data });
  };

  const clearProfile = async () => {
    await db.profile.delete('profile');
  };

  return {
    profile,
    saveProfile,
    clearProfile,
    isLoading
  };
}
