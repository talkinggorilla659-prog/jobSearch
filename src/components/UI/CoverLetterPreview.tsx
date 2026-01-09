import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CoverLetterPreviewProps {
  text: string;
  className?: string;
}

export function CoverLetterPreview({ text, className = '' }: CoverLetterPreviewProps) {
  if (!text || text.trim().length < 50) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Generate a cover letter to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 overflow-auto font-serif ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs - format as letter paragraphs
          p: ({ children }) => {
            const text = String(children);

            // Date line (typically first short line with month or numbers)
            const isDate = /^(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2})/i.test(text.trim());
            if (isDate && text.length < 30) {
              return <p className="text-sm text-gray-600 mb-6">{children}</p>;
            }

            // Greeting line (Dear, Hello, Hi, To Whom)
            const isGreeting = /^(dear|hello|hi|to whom)/i.test(text.trim());
            if (isGreeting) {
              return <p className="text-sm text-gray-900 mb-4">{children}</p>;
            }

            // Closing line (Sincerely, Best, Regards, etc.)
            const isClosing = /^(sincerely|best regards|best|regards|thank you|warm regards|kind regards|respectfully|yours truly|cordially)/i.test(text.trim());
            if (isClosing) {
              return <p className="text-sm text-gray-700 mt-6 mb-1">{children}</p>;
            }

            // Signature (short line after closing, usually just a name)
            // This is tricky - we'll style short lines after closing differently
            if (text.length < 50 && !text.includes(' ') || /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(text.trim())) {
              return <p className="text-sm text-gray-900 font-medium">{children}</p>;
            }

            // Regular body paragraph
            return <p className="text-sm text-gray-700 leading-relaxed mb-3">{children}</p>;
          },
          // Bold text for emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          // Italic text
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // Bullet lists (if any)
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700">{children}</li>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
