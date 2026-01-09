import { useLiveQuery } from 'dexie-react-hooks';
import { db, Job } from '../lib/db';

export function useJobs() {
  const jobs = useLiveQuery(
    () => db.jobs.orderBy('createdAt').reverse().toArray()
  );

  const addJob = async (
    job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'notes'>
  ) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.jobs.add({
      id,
      notes: '',
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: job.status, date: now }],
      ...job
    });
    return id;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    const job = await db.jobs.get(id);
    if (!job) return;

    const newUpdates = { ...updates };

    if (updates.status && updates.status !== job.status) {
      newUpdates.statusHistory = [
        ...job.statusHistory,
        { status: updates.status, date: new Date().toISOString() }
      ];
    }

    await db.jobs.update(id, {
      ...newUpdates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteJob = async (id: string) => {
    await db.jobs.delete(id);
  };

  const getJob = async (id: string) => {
    return db.jobs.get(id);
  };

  const getJobsByStatus = async (status: Job['status']) => {
    return db.jobs.where('status').equals(status).toArray();
  };

  return {
    jobs: jobs ?? [],
    addJob,
    updateJob,
    deleteJob,
    getJob,
    getJobsByStatus,
    isLoading: jobs === undefined
  };
}
