import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
} from 'docx';
import { parseResume } from './resume-pdf/parseResume';
import type { ResumeData, TemplateType } from './resume-pdf/types';

// Strip markdown syntax for plain text parsing
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

// Color schemes for templates
const COLORS = {
  modern: {
    primary: '2563eb',    // Blue
    text: '1e293b',       // Dark slate
    muted: '64748b',      // Gray
  },
  classic: {
    primary: '1a1a1a',    // Near black
    text: '1a1a1a',       // Near black
    muted: '666666',      // Medium gray
  },
  minimalist: {
    primary: '000000',    // Black
    text: '333333',       // Dark gray
    muted: '777777',      // Medium gray
  },
};

// Font families
const FONTS = {
  modern: 'Arial',
  classic: 'Times New Roman',
  minimalist: 'Arial',
};

function generateModernDocx(data: ResumeData): Document {
  const colors = COLORS.modern;
  const font = FONTS.modern;
  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.name,
          bold: true,
          size: 48,
          color: colors.primary,
          font,
        }),
      ],
      spacing: { after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: colors.primary },
      },
    })
  );

  // Contact info
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20,
            color: colors.muted,
            font,
          }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
            color: colors.primary,
            font,
          }),
        ],
        spacing: { before: 200, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
        },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 22, color: colors.text, font })],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 24,
            color: colors.primary,
            font,
          }),
        ],
        spacing: { before: 200, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
        },
      })
    );

    for (const exp of data.experience) {
      // Job title and dates on same line
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22, color: colors.text, font }),
            new TextRun({ text: `\t${exp.dates}`, size: 20, color: colors.muted, font }),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
          spacing: { before: 120 },
        })
      );

      if (exp.company) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.company, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 22, color: colors.text, font })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
            color: colors.primary,
            font,
          }),
        ],
        spacing: { before: 200, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
        },
      })
    );

    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, color: colors.text, font }),
            edu.year ? new TextRun({ text: `\t${edu.year}`, size: 20, color: colors.muted, font }) : new TextRun(''),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
        })
      );
      if (edu.school) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.school, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Skills
  if (data.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 24,
            color: colors.primary,
            font,
          }),
        ],
        spacing: { before: 200, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
        },
      })
    );

    // Skills as bullet list
    for (const skill of data.skills) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: skill, size: 22, color: colors.text, font })],
          bullet: { level: 0 },
          spacing: { after: 40 },
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });
}

function generateClassicDocx(data: ResumeData): Document {
  const colors = COLORS.classic;
  const font = FONTS.classic;
  const children: Paragraph[] = [];

  // Name - centered
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.name.toUpperCase(),
          bold: true,
          size: 52,
          color: colors.primary,
          font,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );

  // Contact info - centered
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 20,
            color: colors.muted,
            font,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        border: {
          bottom: { style: BorderStyle.DOUBLE, size: 6, color: colors.primary },
        },
      })
    );
  }

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 26,
            color: colors.primary,
            font,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.muted },
        },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 22, color: colors.text, font })],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 26,
            color: colors.primary,
            font,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.muted },
        },
      })
    );

    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 24, color: colors.text, font }),
            new TextRun({ text: `\t${exp.dates}`, italics: true, size: 22, color: colors.muted, font }),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
          spacing: { before: 160 },
        })
      );

      if (exp.company) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.company, italics: true, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 22, color: colors.text, font })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 26,
            color: colors.primary,
            font,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.muted },
        },
      })
    );

    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, color: colors.text, font }),
            edu.year ? new TextRun({ text: `\t${edu.year}`, size: 22, color: colors.muted, font }) : new TextRun(''),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
        })
      );
      if (edu.school) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.school, italics: true, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Skills
  if (data.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS & COMPETENCIES',
            bold: true,
            size: 26,
            color: colors.primary,
            font,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.muted },
        },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.skills.join('  •  '), size: 22, color: colors.text, font })],
        spacing: { after: 100 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1008, right: 1008, bottom: 1008, left: 1008 } },
        },
        children,
      },
    ],
  });
}

function generateMinimalistDocx(data: ResumeData): Document {
  const colors = COLORS.minimalist;
  const font = FONTS.minimalist;
  const children: Paragraph[] = [];

  // Name - simple, large
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.name,
          size: 56,
          color: colors.primary,
          font,
        }),
      ],
      spacing: { after: 120 },
    })
  );

  // Contact info
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
  ].filter(Boolean);

  for (const part of contactParts) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: part, size: 18, color: colors.muted, font })],
        spacing: { after: 20 },
      })
    );
  }

  children.push(new Paragraph({ spacing: { after: 240 } }));

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ABOUT',
            bold: true,
            size: 18,
            color: colors.muted,
            font,
          }),
        ],
        spacing: { after: 80 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 22, color: colors.text, font })],
        spacing: { after: 280 },
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 18,
            color: colors.muted,
            font,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 24, color: colors.primary, font }),
            new TextRun({ text: `\t${exp.dates}`, size: 18, color: colors.muted, font }),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
          spacing: { before: 160 },
        })
      );

      if (exp.company) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.company, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: '—  ', size: 22, color: colors.muted, font }),
              new TextRun({ text: bullet, size: 22, color: colors.text, font }),
            ],
            indent: { left: 200 },
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 18,
            color: colors.muted,
            font,
          }),
        ],
        spacing: { before: 280, after: 120 },
      })
    );

    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, color: colors.text, font }),
            edu.year ? new TextRun({ text: `\t${edu.year}`, size: 18, color: colors.muted, font }) : new TextRun(''),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
        })
      );
      if (edu.school) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.school, size: 22, color: colors.muted, font })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Skills
  if (data.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 18,
            color: colors.muted,
            font,
          }),
        ],
        spacing: { before: 280, after: 120 },
      })
    );

    // Skills as simple tags
    children.push(
      new Paragraph({
        children: data.skills.map((skill, i) =>
          new TextRun({
            text: i < data.skills.length - 1 ? `${skill}   ` : skill,
            size: 20,
            color: colors.text,
            font,
          })
        ),
        spacing: { after: 100 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
        },
        children,
      },
    ],
  });
}

// New styled resume generation with templates
export async function generateStyledResumeDocx(
  content: string,
  template: TemplateType = 'modern'
): Promise<Blob> {
  // Strip markdown syntax before parsing
  const cleanContent = stripMarkdown(content);
  const data = parseResume(cleanContent);

  let doc: Document;
  switch (template) {
    case 'modern':
      doc = generateModernDocx(data);
      break;
    case 'classic':
      doc = generateClassicDocx(data);
      break;
    case 'minimalist':
      doc = generateMinimalistDocx(data);
      break;
    default:
      doc = generateModernDocx(data);
  }

  return await Packer.toBlob(doc);
}

// Keep original function for backwards compatibility
export async function generateResumeDocx(content: string): Promise<Blob> {
  return generateStyledResumeDocx(content, 'modern');
}

export async function generateCoverLetterDocx(
  content: string,
  candidateName: string
): Promise<Blob> {
  // Strip markdown and split into paragraphs
  const cleanContent = stripMarkdown(content);
  const paragraphs = cleanContent.split('\n\n').filter((p) => p.trim());

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          size: 22
        })
      ],
      spacing: { after: 400 }
    })
  );

  for (const para of paragraphs) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: para.trim(), size: 22 })],
        spacing: { after: 240 }
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Sincerely,', size: 22 })],
      spacing: { before: 240, after: 480 }
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: candidateName, size: 22 })]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

// Parse inline markdown formatting (bold, italic) into TextRuns
function parseInlineMarkdown(text: string, color: string, font: string, size: number = 22): TextRun[] {
  const runs: TextRun[] = [];
  // Pattern to match **bold**, *italic*, or regular text
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|[^*]+)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const segment = match[1];

    if (segment.startsWith('**') && segment.endsWith('**')) {
      // Bold text
      runs.push(new TextRun({
        text: segment.slice(2, -2),
        bold: true,
        size,
        color,
        font,
      }));
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      // Italic text
      runs.push(new TextRun({
        text: segment.slice(1, -1),
        italics: true,
        size,
        color,
        font,
      }));
    } else if (segment.trim()) {
      // Regular text
      runs.push(new TextRun({
        text: segment,
        size,
        color,
        font,
      }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size, color, font })];
}

// Generate DOCX directly from markdown - matches preview exactly
export async function generateResumeDocxFromMarkdown(
  markdown: string,
  template: TemplateType = 'modern'
): Promise<Blob> {
  const { marked } = await import('marked');
  const colors = COLORS[template];
  const font = FONTS[template];
  const children: Paragraph[] = [];

  // Parse markdown into tokens
  const tokens = marked.lexer(markdown);

  let isFirstParagraph = true;

  for (const token of tokens) {
    if (token.type === 'heading') {
      if (token.depth === 1) {
        // Name - large, primary color
        children.push(new Paragraph({
          children: [new TextRun({
            text: token.text,
            bold: true,
            size: 48,
            color: colors.primary,
            font,
          })],
          spacing: { after: 100 },
          alignment: template === 'classic' ? AlignmentType.CENTER : AlignmentType.LEFT,
          border: template === 'modern' ? {
            bottom: { style: BorderStyle.SINGLE, size: 12, color: colors.primary },
          } : undefined,
        }));
        isFirstParagraph = true;
      } else if (token.depth === 2) {
        // Section header
        children.push(new Paragraph({
          children: [new TextRun({
            text: token.text.toUpperCase(),
            bold: true,
            size: 24,
            color: colors.primary,
            font,
          })],
          spacing: { before: 240, after: 120 },
          alignment: template === 'classic' ? AlignmentType.CENTER : AlignmentType.LEFT,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.muted },
          },
        }));
        isFirstParagraph = false;
      } else if (token.depth === 3) {
        // Subsection header
        children.push(new Paragraph({
          children: [new TextRun({
            text: token.text,
            bold: true,
            size: 22,
            color: colors.text,
            font,
          })],
          spacing: { before: 160, after: 60 },
        }));
      }
    } else if (token.type === 'paragraph') {
      const text = token.text || '';
      // Check if this is contact info (contains | or email pattern)
      const isContact = isFirstParagraph && (text.includes('|') || /@/.test(text));

      children.push(new Paragraph({
        children: parseInlineMarkdown(text, isContact ? colors.muted : colors.text, font),
        spacing: { after: isContact ? 200 : 120 },
        alignment: template === 'classic' && isContact ? AlignmentType.CENTER : AlignmentType.LEFT,
        border: isContact && template === 'modern' ? {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: colors.primary },
        } : undefined,
      }));
      isFirstParagraph = false;
    } else if (token.type === 'list') {
      for (const item of token.items) {
        const itemText = item.text || '';
        const bulletChar = template === 'minimalist' ? '—' : '-';
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${bulletChar} `, size: 22, color: colors.muted, font }),
            ...parseInlineMarkdown(itemText, colors.text, font),
          ],
          indent: { left: 360 },
          spacing: { after: 60 },
        }));
      }
    } else if (token.type === 'hr') {
      children.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.muted } },
        spacing: { before: 120, after: 120 },
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: template === 'minimalist' ? 1080 : 720,
            right: template === 'minimalist' ? 1080 : 720,
            bottom: template === 'minimalist' ? 1080 : 720,
            left: template === 'minimalist' ? 1080 : 720,
          },
        },
      },
      children,
    }],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
