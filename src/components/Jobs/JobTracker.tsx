import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { Job } from '../../lib/db';
import { Card, LoadingOverlay, Button } from '../UI';

type JobStatus = Job['status'];

const COLUMNS: { status: JobStatus; label: string; color: string }[] = [
  { status: 'saved', label: 'Saved', color: 'bg-gray-100' },
  { status: 'applied', label: 'Applied', color: 'bg-blue-100' },
  { status: 'interview', label: 'Interview', color: 'bg-amber-100' },
  { status: 'offer', label: 'Offer', color: 'bg-green-100' },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-100' }
];

export function JobTracker() {
  const navigate = useNavigate();
  const { jobs, updateJob, isLoading } = useJobs();
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

  const handleDragStart = (job: Job) => {
    setDraggedJob(job);
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (status: JobStatus) => {
    if (draggedJob && draggedJob.status !== status) {
      await updateJob(draggedJob.id, { status });
    }
    setDraggedJob(null);
    setDragOverColumn(null);
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status);
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading tracker..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500">Drag and drop to update status</p>
        </div>
        <Button onClick={() => navigate('/add-job')}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {COLUMNS.map((column) => {
          const columnJobs = getJobsByStatus(column.status);
          const isDragOver = dragOverColumn === column.status;

          return (
            <div
              key={column.status}
              className={`flex-shrink-0 w-72 rounded-lg ${column.color}`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.status)}
            >
              <div className="p-3 border-b border-black/5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">{column.label}</h2>
                  <span className="px-2 py-0.5 bg-white/50 rounded-full text-sm text-gray-600">
                    {columnJobs.length}
                  </span>
                </div>
              </div>

              <div
                className={`p-2 min-h-[300px] transition-colors ${
                  isDragOver ? 'bg-black/5' : ''
                }`}
              >
                {columnJobs.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-sm text-gray-500">
                    No jobs
                  </div>
                ) : (
                  <div className="space-y-2">
                    {columnJobs.map((job) => (
                      <TrackerCard
                        key={job.id}
                        job={job}
                        onDragStart={() => handleDragStart(job)}
                        onClick={() => navigate(`/job/${job.id}`)}
                        isDragging={draggedJob?.id === job.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrackerCardProps {
  job: Job;
  onDragStart: () => void;
  onClick: () => void;
  isDragging: boolean;
}

function TrackerCard({ job, onDragStart, onClick, isDragging }: TrackerCardProps) {
  return (
    <Card
      hover
      className={`p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <h3 className="font-medium text-gray-900 text-sm truncate">{job.title}</h3>
      <p className="text-xs text-gray-500 truncate">{job.company}</p>
      {job.matchScore !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                job.matchScore >= 75
                  ? 'bg-green-500'
                  : job.matchScore >= 50
                  ? 'bg-blue-500'
                  : job.matchScore >= 25
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${job.matchScore}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{job.matchScore}%</span>
        </div>
      )}
    </Card>
  );
}
