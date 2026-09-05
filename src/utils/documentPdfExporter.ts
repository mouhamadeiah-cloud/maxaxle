import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  fileName?: string;
  elementId?: string;
  element?: HTMLElement | null;
  quality?: number;
  scale?: number;
}

/**
 * High-fidelity PDF Exporter for DIN A4 documents.
 * Captures the exact rendered HTML layout, typography, borders, logos,
 * and calculations with pixel-perfect accuracy matching the on-screen document.
 */
export async function exportDocumentToPdf(options: ExportPdfOptions): Promise<boolean> {
  const {
    elementId,
    element,
    fileName = 'Dokument.pdf',
    quality = 0.98,
    scale = 2
  } = options;

  // Resolve target element
  let targetElement: HTMLElement | null = element || null;
  if (!targetElement && elementId) {
    targetElement = document.getElementById(elementId);
  }

  if (!targetElement) {
    // Fallback: look for common document sheet elements
    targetElement = document.querySelector(
      '#operationen-document-a4-sheet, #document-a4-sheet, #interactive-document-a4-sheet, .a4-print-sheet'
    ) as HTMLElement | null;
  }

  if (!targetElement) {
    console.error('[PDF Export] Document element not found for export.');
    return false;
  }

  try {
    // Check if there are multiple A4 sheets inside the container (e.g. EU-Export multi-page)
    const subSheets = targetElement.querySelectorAll<HTMLElement>('.a4-print-sheet');
    const sheetsToExport: HTMLElement[] = subSheets.length > 1 
      ? Array.from(subSheets) 
      : [targetElement];

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < sheetsToExport.length; i++) {
      const sheet = sheetsToExport[i];

      // Hide any controls or elements marked as print:hidden during capture
      const hiddenElements = sheet.querySelectorAll<HTMLElement>('.print\\:hidden, [data-print-hidden="true"], button');
      const originalDisplays: string[] = [];
      hiddenElements.forEach((el) => {
        originalDisplays.push(el.style.display);
        el.style.display = 'none';
      });

      const canvas = await html2canvas(sheet, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Remove shadows or extra borders in cloned document
          const clonedSheets = clonedDoc.querySelectorAll<HTMLElement>('.a4-print-sheet, #document-a4-sheet, #operationen-document-a4-sheet');
          clonedSheets.forEach((s) => {
            s.style.boxShadow = 'none';
            s.style.borderRadius = '0px';
          });
        }
      });

      // Restore hidden elements display
      hiddenElements.forEach((el, idx) => {
        el.style.display = originalDisplays[idx];
      });

      const imgData = canvas.toDataURL('image/jpeg', quality);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // DIN A4 standard dimensions: 210mm x 297mm
      const pageWidthMm = 210;
      const pageHeightMm = 297;

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pageWidthMm,
        pageHeightMm,
        undefined,
        'FAST'
      );
    }

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('[PDF Export] Failed to generate PDF:', error);
    return false;
  }
}
