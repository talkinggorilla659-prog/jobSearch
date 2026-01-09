import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { Job } from '../../lib/db';
import {
  Button,
  Card,
  CardContent,
  StatusBadge,
  MatchScore,
  Textarea,
  SkeletonJobDetail,
  Modal
} from '../UI';
import { formatDate } from '../../utils/format';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob, deleteJob } = useJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobData = await getJob(id);
      if (jobData) {
        setJob(jobData);
        setNotes(jobData.notes);
      }
      setIsLoading(false);
    };
    loadJob();
  }, [id]);

  const handleStatusChange = async (newStatus: Job['status']) => {
    if (!job) return;
    await updateJob(job.id, { status: newStatus });
    setJob({ ...job, status: newStatus });
  };

  const handleSaveNotes = async () => {
    if (!job) return;
    await updateJob(job.id, { notes });
  };

  const handleDelete = async () => {
    if (!job) return;
    await deleteJob(job.id);
    navigate('/');
  };

  if (isLoading) {
    return <SkeletonJobDetail />;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const statuses: Job['status'][] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600">{job.company}</p>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View original posting
                  </a>
                )}
              </div>
              {job.matchScore !== undefined && (
                <MatchScore score={job.matchScore} size="lg" />
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      job.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        {job.analysis && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {job.analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Gaps
                </h3>
                <ul className="space-y-1">
                  {job.analysis.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500">!</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3">Generate Materials</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/job/${job.id}/resume`)}>
                {job.tailoredResume ? 'View Tailored Resume' : 'Generate Resume'}
                {job.tailoredResume && (
                  <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>
              <Button onClick={() => navigate(`/job/${job.id}/cover-letter`)} variant="secondary">
                {job.coverLetter ? 'View Cover Letter' : 'Generate Cover Letter'}
                {job.coverLetter && (
                  <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>
              <Button onClick={() => navigate(`/job/${job.id}/interview-prep`)} variant="secondary">
                {job.interviewQuestions?.length ? 'View Interview Prep' : 'Interview Prep'}
                {job.interviewQuestions?.length ? (
                  <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </Button>
              <Button onClick={() => navigate(`/job/${job.id}/email-templates`)} variant="secondary">
                Email Templates
              </Button>
              <Button onClick={() => navigate(`/job/${job.id}/resume-optimization`)} variant="secondary">
                {job.resumeOptimization ? 'View Optimization' : 'Resume Optimization'}
                {job.resumeOptimization && (
                  <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this job..."
              rows={4}
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3">Activity Timeline</h3>
            <div className="space-y-2">
              {job.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">{formatDate(entry.date)}</span>
                  <StatusBadge status={entry.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete */}
        <div className="flex justify-end">
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete Job
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this job? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
