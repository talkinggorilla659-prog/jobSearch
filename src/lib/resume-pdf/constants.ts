import type { TemplateType } from './types';

// Template options for UI - lightweight, no react-pdf dependency
export const TEMPLATE_OPTIONS: { value: TemplateType; label: string; description: string }[] = [
  {
    value: 'modern',
    label: 'Modern',
    description: 'Clean design with blue accents',
  },
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional serif layout',
  },
  {
    value: 'minimalist',
    label: 'Minimalist',
    description: 'Maximum whitespace, simple typography',
  },
];
