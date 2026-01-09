import { Card, CardContent, Button, MatchScore } from '../UI';
import { JobAnalysis as JobAnalysisType } from '../../types';

interface JobAnalysisProps {
  analysis: JobAnalysisType;
  onGenerateResume: () => void;
  onGenerateCoverLetter: () => void;
  onSave: () => void;
}

export function JobAnalysis({
  analysis,
  onGenerateResume,
  onGenerateCoverLetter,
  onSave
}: JobAnalysisProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{analysis.title}</h2>
              <p className="text-gray-600">{analysis.company}</p>
            </div>
            <MatchScore score={analysis.matchScore} size="lg" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{strength}</span>
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
              Potential Gaps
            </h3>
            {analysis.gaps.length > 0 ? (
              <ul className="space-y-2">
                {analysis.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No significant gaps identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-3">Key Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.requirements.map((req, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {req}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-3">Keywords to Include</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These keywords appear in the job posting - consider including them in your application
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onGenerateResume} className="flex-1 sm:flex-none">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Tailored Resume
        </Button>
        <Button onClick={onGenerateCoverLetter} variant="secondary" className="flex-1 sm:flex-none">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Generate Cover Letter
        </Button>
        <Button onClick={onSave} variant="ghost" className="flex-1 sm:flex-none">
          Save to Tracker
        </Button>
      </div>
    </div>
  );
}
