import { OperationDocumentType } from '../types';
import { firebaseService } from '../services/firebaseService';

/**
 * Auto-generated sequence starting with the current Year and Month
 * followed by an incremental number starting from 1000 (e.g., YYMM-1000).
 * Examples for August 2026:
 * - Pure format: 2608-1000, 2608-1001, ...
 * - Prefixed format: RE-2608-1000, ANG-2608-1000, ERECH-2608-1000, EXP-EU-2608-1000, EXP-DRITT-2608-1000
 */
export function generateDocumentSerial(
  documentType: OperationDocumentType, 
  customDate?: string,
  withPrefix: boolean = true
): string {
  const now = new Date();
  
  // Year YY (2 digits) and Month MM (2 digits)
  let yy = String(now.getFullYear()).slice(-2);
  let mm = String(now.getMonth() + 1).padStart(2, '0');

  // If custom date was provided in DD.MM.YYYY or YYYY-MM-DD
  if (customDate) {
    if (customDate.includes('.')) {
      const parts = customDate.split('.');
      if (parts.length === 3) {
        mm = parts[1].padStart(2, '0');
        yy = parts[2].slice(-2);
      }
    } else if (customDate.includes('-')) {
      const parts = customDate.split('-');
      if (parts.length === 3) {
        yy = parts[0].slice(-2);
        mm = parts[1].padStart(2, '0');
      }
    }
  }

  const yymm = `${yy}${mm}`;
  const baseSequenceStart = 1000;

  // Retrieve existing operations & invoices to find highest sequence for this YYMM
  let maxSeq = baseSequenceStart - 1;

  try {
    const existingOps = firebaseService.getOperations();
    const existingInvoices = firebaseService.getInvoices();

    const allNumbers = [
      ...existingOps.map(o => o.documentNumber),
      ...existingInvoices.map(i => i.invoiceNumber)
    ].filter(Boolean);

    allNumbers.forEach(numStr => {
      // Look for patterns like 2608-1002 or RE-2608-1002
      const match = numStr.match(/(\d{4})-(\d{4,})/);
      if (match) {
        const docYYMM = match[1];
        const docSeq = parseInt(match[2], 10);
        if (docYYMM === yymm && !isNaN(docSeq)) {
          if (docSeq > maxSeq) {
            maxSeq = docSeq;
          }
        }
      }
    });
  } catch (e) {
    console.error('Error determining document sequence number', e);
  }

  const nextSeq = maxSeq + 1;
  const serialSuffix = `${yymm}-${nextSeq}`;

  if (!withPrefix) {
    return serialSuffix;
  }

  const prefixMap: Record<OperationDocumentType, string> = {
    angebot: 'ANG',
    rechnung: 'RE',
    e_rechnung: 'ERECH',
    eu_export: 'EXP-EU',
    export_drittland: 'EXP-DRITT',
    kaufvertrag: 'KV',
    probefahrt: 'PF',
    uebergabeprotokoll: 'UEP'
  };

  const prefix = prefixMap[documentType] || 'DOC';
  return `${prefix}-${serialSuffix}`;
}

export function getDocumentTypeLabel(type: OperationDocumentType): string {
  switch (type) {
    case 'angebot': return 'Angebot';
    case 'rechnung': return 'Rechnung';
    case 'e_rechnung': return 'E-Rechnung (EN 16931)';
    case 'eu_export': return 'EU-Export Rechnung';
    case 'export_drittland': return 'Ausfuhr-Rechnung (Drittland)';
    case 'kaufvertrag': return 'Kaufvertrag';
    case 'probefahrt': return 'Probefahrtvereinbarung';
    case 'uebergabeprotokoll': return 'Übergabeprotokoll';
    default: return 'Dokument';
  }
}
