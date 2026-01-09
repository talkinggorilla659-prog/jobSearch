import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use bundled worker instead of CDN to comply with CSP
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TextItemWithPosition {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Extract items with position data
    const items: TextItemWithPosition[] = textContent.items
      .filter((item): item is { str: string; transform: number[]; width: number; height: number; dir: string; fontName: string; hasEOL: boolean } =>
        'str' in item && 'transform' in item
      )
      .map(item => ({
        str: item.str,
        transform: item.transform,
        width: item.width || 0,
        height: item.height || 0
      }));

    if (items.length === 0) {
      continue;
    }

    // Sort items by Y position (descending - top to bottom) then X position
    // PDF coordinates: Y increases upward, so we sort descending for top-to-bottom
    items.sort((a, b) => {
      const yA = a.transform[5];
      const yB = b.transform[5];
      const yDiff = yB - yA;

      // If on roughly the same line (within 8 units), sort by X
      // Using 8 to handle slight vertical offsets in text like "McAllen"
      if (Math.abs(yDiff) < 8) {
        return a.transform[4] - b.transform[4];
      }
      return yDiff;
    });

    const lines: string[] = [];
    let currentLine: string[] = [];
    let lastY: number | null = null;
    let lastX: number | null = null;
    let lastWidth = 0;

    for (const item of items) {
      const x = item.transform[4];
      const y = item.transform[5];
      const text = item.str;

      if (lastY !== null) {
        const yDiff = Math.abs(y - lastY);

        // Detect new line: significant Y change (more than ~line height)
        // Using 12 to prevent splitting words with slight vertical offsets
        if (yDiff > 12) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(''));
            currentLine = [];
          }

          // Detect paragraph break: larger Y gap (roughly 2x line height)
          if (yDiff > 24 && lines.length > 0) {
            lines.push('');
          }
        } else if (lastX !== null) {
          // Same line - check if we need a space
          const expectedX = lastX + lastWidth;
          const gap = x - expectedX;

          // Add space if there's a gap between words
          if (gap > 2 && currentLine.length > 0) {
            currentLine.push(' ');
          }
        }
      }

      if (text.trim()) {
        currentLine.push(text);
      }

      lastY = y;
      lastX = x;
      lastWidth = item.width;
    }

    // Don't forget the last line
    if (currentLine.length > 0) {
      lines.push(currentLine.join(''));
    }

    // Join lines and clean up
    const pageText = lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines
      .trim();

    if (pageText) {
      textParts.push(pageText);
    }
  }

  return textParts.join('\n\n---\n\n');
}
