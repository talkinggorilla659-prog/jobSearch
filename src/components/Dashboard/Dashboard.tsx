import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useProfile } from '../../hooks/useProfile';
import { StatsBar } from './StatsBar';
import { JobList } from './JobList';
import { Button, SkeletonDashboard } from '../UI';
import { Job } from '../../lib/db';

export function Dashboard() {
  const navigate = useNavigate();
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { profile, isLoading: profileLoading } = useProfile();

  const isLoading = jobsLoading || profileLoading;

  const handleAddJob = () => {
    navigate('/add-job');
  };

  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-gray-500">Track and manage your job applications</p>
        </div>
        <Button onClick={handleAddJob}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Button>
      </div>

      <StatsBar jobs={jobs} />

      <JobList
        jobs={jobs}
        onJobClick={handleJobClick}
        onAddJob={handleAddJob}
      />
    </div>
  );
}
