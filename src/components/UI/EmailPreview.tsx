import { useMemo } from 'react';

interface EmailPreviewProps {
  text: string;
  className?: string;
}

interface ParsedEmail {
  subject: string;
  greeting: string;
  body: string[];
  signature: string[];
}

function parseEmail(text: string): ParsedEmail | null {
  if (!text || text.trim().length < 20) return null;

  const lines = text.split('\n').map(line => line.trim());
  let subject = '';
  let greeting = '';
  const body: string[] = [];
  const signature: string[] = [];

  let inSignature = false;
  let foundGreeting = false;

  // Closing phrases that indicate signature block
  const closingPhrases = [
    'best regards', 'best', 'sincerely', 'regards', 'thank you',
    'thanks', 'warm regards', 'kind regards', 'cheers', 'respectfully'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Look for subject line
    if (lineLower.startsWith('subject:')) {
      subject = line.substring(8).trim();
      continue;
    }

    // Look for greeting
    if (!foundGreeting && (
      lineLower.startsWith('dear ') ||
      lineLower.startsWith('hi ') ||
      lineLower.startsWith('hello ') ||
      lineLower.startsWith('good morning') ||
      lineLower.startsWith('good afternoon') ||
      lineLower.startsWith('good evening')
    )) {
      greeting = line;
      foundGreeting = true;
      continue;
    }

    // Check if we're entering signature block
    if (!inSignature) {
      const isClosing = closingPhrases.some(phrase =>
        lineLower === phrase ||
        lineLower.startsWith(phrase + ',') ||
        lineLower.startsWith(phrase + '!')
      );
      if (isClosing) {
        inSignature = true;
        signature.push(line);
        continue;
      }
    }

    if (inSignature) {
      signature.push(line);
    } else if (foundGreeting || line.length > 0) {
      // Add to body (skip empty lines at the start before greeting)
      body.push(line);
    }
  }

  // If no greeting found, first non-empty line of body might be the greeting
  if (!greeting && body.length > 0) {
    const firstLine = body[0].toLowerCase();
    if (firstLine.startsWith('dear ') || firstLine.startsWith('hi ') || firstLine.startsWith('hello ')) {
      greeting = body.shift() || '';
    }
  }

  return { subject, greeting, body, signature };
}

export function EmailPreview({ text, className = '' }: EmailPreviewProps) {
  const parsed = useMemo(() => parseEmail(text), [text]);

  if (!parsed) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Generate an email to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-auto ${className}`}>
      {/* Email header area */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        {parsed.subject ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Subject:</span>
            <span className="text-sm font-semibold text-gray-900">{parsed.subject}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 italic">No subject line</span>
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="p-4 space-y-4">
        {/* Greeting */}
        {parsed.greeting && (
          <p className="text-sm text-gray-900">{parsed.greeting}</p>
        )}

        {/* Body paragraphs */}
        <div className="space-y-3">
          {parsed.body.map((paragraph, index) => {
            if (!paragraph) {
              return <div key={index} className="h-2" />;
            }
            return (
              <p key={index} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Signature */}
        {parsed.signature.length > 0 && (
          <div className="pt-2 border-t border-gray-100 mt-4">
            {parsed.signature.map((line, index) => (
              <p
                key={index}
                className={`text-sm ${index === 0 ? 'text-gray-700' : 'text-gray-600'}`}
              >
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
