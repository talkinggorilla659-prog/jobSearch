import { useState } from 'react';
import { Job } from '../../lib/db';
import { JobCard } from './JobCard';
import { JobsEmptyState } from '../UI';

interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onAddJob: () => void;
}

type FilterStatus = 'all' | Job['status'];
type SortBy = 'date' | 'match';

export function JobList({ jobs, onJobClick, onAddJob }: JobListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'match') {
      return (b.matchScore ?? 0) - (a.matchScore ?? 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (jobs.length === 0) {
    return <JobsEmptyState onAddJob={onAddJob} />;
  }

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'saved', label: 'Saved' },
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="match">Sort by Match %</option>
        </select>
      </div>

      {sortedJobs.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No jobs match the current filter
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
          ))}
        </div>
      )}
    </div>
  );
}
