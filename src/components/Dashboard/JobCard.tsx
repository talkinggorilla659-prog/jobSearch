import { Job } from '../../lib/db';
import { Card, StatusBadge, ProgressBar } from '../UI';
import { formatRelativeDate } from '../../utils/format';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <Card hover onClick={onClick} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
          <p className="text-sm text-gray-500 truncate">{job.company}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {job.matchScore !== undefined && (
        <div className="mt-3">
          <ProgressBar value={job.matchScore} showLabel size="sm" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>Added {formatRelativeDate(job.createdAt)}</span>
        {job.analysis && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            View analysis
          </span>
        )}
      </div>
    </Card>
  );
}
