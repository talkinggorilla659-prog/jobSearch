/**
 * PDF generation by capturing the preview element directly.
 * This ensures the PDF matches exactly what the user sees in the preview.
 */

export async function generateResumePDFFromPreview(): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default;

  const previewElement = document.querySelector('[data-resume-preview]') as HTMLElement | null;
  if (!previewElement) {
    throw new Error('Preview element not found. Please ensure you are in preview mode.');
  }

  // Store original styles to restore later
  const originalMaxHeight = previewElement.style.maxHeight;
  const originalHeight = previewElement.style.height;
  const originalOverflow = previewElement.style.overflow;

  try {
    // Temporarily remove height constraints to capture full content
    previewElement.style.maxHeight = 'none';
    previewElement.style.height = 'auto';
    previewElement.style.overflow = 'visible';

    // Force browser reflow
    void previewElement.offsetHeight;

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename: 'resume.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    const blob = await html2pdf().set(options).from(previewElement).outputPdf('blob');
    return blob as Blob;
  } finally {
    // Restore original styles
    previewElement.style.maxHeight = originalMaxHeight;
    previewElement.style.height = originalHeight;
    previewElement.style.overflow = originalOverflow;
  }
}
