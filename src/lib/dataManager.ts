import { db } from './db';

export async function exportAllData(): Promise<string> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: await db.profile.toArray(),
    jobs: await db.jobs.toArray(),
    settings: await db.settings.toArray()
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);

  if (data.version !== 1) {
    throw new Error('Incompatible data version');
  }

  await db.profile.clear();
  await db.jobs.clear();
  await db.settings.clear();

  if (data.profile?.length) await db.profile.bulkPut(data.profile);
  if (data.jobs?.length) await db.jobs.bulkPut(data.jobs);
  if (data.settings?.length) await db.settings.bulkPut(data.settings);
}

export async function clearAllData(): Promise<void> {
  await db.profile.clear();
  await db.jobs.clear();
  await db.settings.clear();
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
