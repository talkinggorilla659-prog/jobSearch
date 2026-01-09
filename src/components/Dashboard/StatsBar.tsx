import { useState } from 'react';
import { Job } from '../../lib/db';

interface StatsBarProps {
  jobs: Job[];
}

export function StatsBar({ jobs }: StatsBarProps) {
  const [showMore, setShowMore] = useState(false);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Basic counts
  const stats = {
    total: jobs.length,
    saved: jobs.filter((j) => j.status === 'saved').length,
    applied: jobs.filter((j) => j.status === 'applied').length,
    interviews: jobs.filter((j) => j.status === 'interview').length,
    offers: jobs.filter((j) => j.status === 'offer').length,
    rejected: jobs.filter((j) => j.status === 'rejected').length,
  };

  // Calculate totals for rates
  const totalApplied = stats.applied + stats.interviews + stats.offers + stats.rejected;

  // Response rate (interviews + offers out of all applied)
  const responseRate =
    totalApplied > 0
      ? Math.round(((stats.interviews + stats.offers) / totalApplied) * 100)
      : 0;

  // Interview to offer conversion
  const interviewsWithOutcome = stats.offers + jobs.filter(
    (j) => j.status === 'rejected' && j.statusHistory.some((h) => h.status === 'interview')
  ).length;
  const offerRate =
    interviewsWithOutcome > 0
      ? Math.round((stats.offers / interviewsWithOutcome) * 100)
      : 0;

  // Average match score
  const jobsWithScore = jobs.filter((j) => j.matchScore !== undefined);
  const avgMatchScore =
    jobsWithScore.length > 0
      ? Math.round(
          jobsWithScore.reduce((sum, j) => sum + (j.matchScore || 0), 0) /
            jobsWithScore.length
        )
      : null;

  // Activity metrics
  const jobsThisWeek = jobs.filter(
    (j) => new Date(j.createdAt) >= oneWeekAgo
  ).length;
  const jobsThisMonth = jobs.filter(
    (j) => new Date(j.createdAt) >= oneMonthAgo
  ).length;

  // Applications this week
  const appliedThisWeek = jobs.filter((j) => {
    const appliedEntry = j.statusHistory.find((h) => h.status === 'applied');
    return appliedEntry && new Date(appliedEntry.date) >= oneWeekAgo;
  }).length;

  // Days since last activity
  const lastActivity = jobs.reduce((latest, job) => {
    const jobDate = new Date(job.updatedAt);
    return jobDate > latest ? jobDate : latest;
  }, new Date(0));
  const daysSinceActivity =
    jobs.length > 0
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
      : null;

  return (
    <div className="mb-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <StatCard label="Jobs Tracked" value={stats.total} />
        <StatCard
          label="Applied"
          value={totalApplied}
          trend={appliedThisWeek > 0 ? `+${appliedThisWeek} this week` : undefined}
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          color={stats.interviews > 0 ? 'green' : undefined}
        />
        <StatCard
          label="Response Rate"
          value={totalApplied > 2 ? `${responseRate}%` : '-'}
          sublabel={totalApplied <= 2 ? 'Need more data' : undefined}
          color={responseRate >= 20 ? 'green' : responseRate > 0 ? 'yellow' : undefined}
        />
      </div>

      {/* Toggle for more stats */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {showMore ? 'Show less' : 'Show more stats'}
      </button>

      {/* Extended Stats */}
      {showMore && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Offers"
            value={stats.offers}
            color={stats.offers > 0 ? 'green' : undefined}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            color={stats.rejected > 0 ? 'red' : undefined}
          />
          <StatCard
            label="Saved (Not Applied)"
            value={stats.saved}
          />
          <StatCard
            label="Avg Match Score"
            value={avgMatchScore !== null ? `${avgMatchScore}%` : '-'}
            sublabel={avgMatchScore === null ? 'No scores yet' : undefined}
            color={
              avgMatchScore !== null
                ? avgMatchScore >= 70
                  ? 'green'
                  : avgMatchScore >= 50
                  ? 'yellow'
                  : undefined
                : undefined
            }
          />
          <StatCard
            label="Jobs This Week"
            value={jobsThisWeek}
            trend={jobsThisWeek > 0 ? 'Active' : 'No new jobs'}
            trendColor={jobsThisWeek > 0 ? 'green' : 'gray'}
          />
          <StatCard
            label="Jobs This Month"
            value={jobsThisMonth}
          />
          <StatCard
            label="Interview Rate"
            value={
              interviewsWithOutcome > 0 ? `${offerRate}%` : '-'
            }
            sublabel="Interviews to offers"
          />
          <StatCard
            label="Last Activity"
            value={
              daysSinceActivity === null
                ? '-'
                : daysSinceActivity === 0
                ? 'Today'
                : daysSinceActivity === 1
                ? 'Yesterday'
                : `${daysSinceActivity} days ago`
            }
            color={
              daysSinceActivity !== null && daysSinceActivity > 7
                ? 'red'
                : undefined
            }
          />
        </div>
      )}

      {/* Motivational Tip */}
      {stats.total > 0 && daysSinceActivity !== null && daysSinceActivity > 3 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Keep the momentum!</span> It's been {daysSinceActivity} days since your last activity.
            Consistency is key in job searching.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  trend,
  trendColor = 'blue',
  color
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: string;
  trendColor?: 'blue' | 'green' | 'gray';
  color?: 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-amber-600',
    red: 'text-red-600'
  };

  const trendColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-400'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`text-2xl font-semibold ${
          color ? colorClasses[color] : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      {trend && (
        <p className={`text-xs ${trendColorClasses[trendColor]}`}>{trend}</p>
      )}
    </div>
  );
}
