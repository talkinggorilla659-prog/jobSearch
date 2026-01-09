import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TemplateType } from '../../lib/resume-pdf/types';

interface ResumePreviewProps {
  text: string;
  template?: TemplateType;
  className?: string;
}

// Template color schemes matching PDF templates
const TEMPLATE_STYLES = {
  modern: {
    container: 'font-sans',
    name: 'text-blue-600 text-2xl font-bold mb-1',
    contact: 'text-slate-500 text-sm mb-4 pb-4 border-b-2 border-blue-600',
    sectionHeader: 'text-blue-600 text-sm font-bold uppercase tracking-wide mt-5 mb-2 pb-1 border-b border-slate-200',
    jobTitle: 'text-slate-800 font-semibold',
    company: 'text-slate-500',
    dates: 'text-slate-400',
    text: 'text-slate-700 text-sm',
    bullet: 'text-slate-700',
    skill: 'text-slate-700',
    strong: 'font-semibold text-slate-800',
    emphasis: 'italic text-slate-400',
  },
  classic: {
    container: 'font-serif',
    name: 'text-gray-900 text-2xl font-bold mb-1 text-center',
    contact: 'text-gray-600 text-sm mb-4 pb-4 border-b-2 border-gray-900 text-center',
    sectionHeader: 'text-gray-900 text-sm font-bold uppercase tracking-wide mt-5 mb-2 pb-1 border-b border-gray-300 text-center',
    jobTitle: 'text-gray-800 font-semibold',
    company: 'text-gray-600 italic',
    dates: 'text-gray-500',
    text: 'text-gray-700 text-sm',
    bullet: 'text-gray-700',
    skill: 'text-gray-700',
    strong: 'font-semibold text-gray-800',
    emphasis: 'italic text-gray-500',
  },
  minimalist: {
    container: 'font-sans',
    name: 'text-black text-3xl mb-2',
    contact: 'text-gray-500 text-sm mb-6',
    sectionHeader: 'text-gray-400 text-xs font-bold uppercase tracking-widest mt-6 mb-3',
    jobTitle: 'text-black font-semibold',
    company: 'text-gray-500',
    dates: 'text-gray-400',
    text: 'text-gray-600 text-sm',
    bullet: 'text-gray-400',
    skill: 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm inline-block mr-2 mb-1',
    strong: 'font-semibold text-black',
    emphasis: 'italic text-gray-400',
  },
};

export function ResumePreview({ text, template = 'modern', className = '' }: ResumePreviewProps) {
  const styles = useMemo(() => TEMPLATE_STYLES[template], [template]);

  if (!text || text.trim().length < 50) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Paste your resume to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div data-resume-preview className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm overflow-auto ${styles.container} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Name (h1)
          h1: ({ children }) => (
            <h1 className={styles.name}>{children}</h1>
          ),
          // Section headers (h2)
          h2: ({ children }) => (
            <h2 className={styles.sectionHeader}>{children}</h2>
          ),
          // Subsection (h3)
          h3: ({ children }) => (
            <h3 className={`${styles.jobTitle} mt-3 mb-1`}>{children}</h3>
          ),
          // Paragraphs (contact info, summary, etc.)
          p: ({ children }) => {
            // Check if this is likely contact info (contains | or @ symbols in short text)
            const text = String(children);
            if ((text.includes('|') || (text.includes('@') && !text.includes(' at '))) && text.length < 150) {
              return <p className={styles.contact}>{children}</p>;
            }
            return <p className={`${styles.text} mb-2 leading-relaxed`}>{children}</p>;
          },
          // Bullet lists
          ul: ({ children }) => (
            <ul className="list-none space-y-1 mb-3">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className={`${styles.text} flex items-start`}>
              <span className={`mr-2 ${styles.bullet}`}>-</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          // Bold text (job titles, company names)
          strong: ({ children }) => (
            <strong className={styles.strong}>{children}</strong>
          ),
          // Italic text (dates)
          em: ({ children }) => (
            <em className={styles.emphasis}>{children}</em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-gray-200" />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
