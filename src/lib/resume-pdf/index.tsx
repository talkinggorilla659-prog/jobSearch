// Re-export types (lightweight, no react-pdf dependency)
export type { ResumeData, TemplateType, ContactInfo, ExperienceEntry, EducationEntry } from './types';
export { TEMPLATE_OPTIONS } from './constants';

import type { TemplateType } from './types';

// Strip markdown syntax for plain text parsing
// This is needed because parseResume expects plain text, not markdown
function stripMarkdown(text: string): string {
  return text
    // Remove headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Convert **bold** to plain text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Convert *italic* to plain text
    .replace(/\*([^*]+)\*/g, '$1')
    // Convert __bold__ to plain text
    .replace(/__([^_]+)__/g, '$1')
    // Convert _italic_ to plain text
    .replace(/_([^_]+)_/g, '$1')
    // Keep bullet points but normalize
    .replace(/^[-*]\s+/gm, '- ')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    .trim();
}

// Generate PDF blob for download - all heavy imports are dynamic
export async function generateResumePDF(
  resumeText: string,
  template: TemplateType = 'modern'
): Promise<Blob> {
  // Dynamic imports to enable code splitting - PDF library only loads when this is called
  const { parseResume } = await import('./parseResume');
  const { pdf } = await import('@react-pdf/renderer');

  // Strip markdown syntax before parsing - parseResume expects plain text
  const cleanContent = stripMarkdown(resumeText);
  const data = parseResume(cleanContent);

  // Dynamically import only the needed template
  let document;
  switch (template) {
    case 'modern': {
      const { ModernResumePDF } = await import('./templates/modern');
      document = <ModernResumePDF data={data} />;
      break;
    }
    case 'classic': {
      const { ClassicResumePDF } = await import('./templates/classic');
      document = <ClassicResumePDF data={data} />;
      break;
    }
    case 'minimalist': {
      const { MinimalistResumePDF } = await import('./templates/minimalist');
      document = <MinimalistResumePDF data={data} />;
      break;
    }
    default: {
      const { ModernResumePDF } = await import('./templates/modern');
      document = <ModernResumePDF data={data} />;
    }
  }

  return pdf(document).toBlob();
}
