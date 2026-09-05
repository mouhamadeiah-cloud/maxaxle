import { OperationDocumentType, OperationVehicleItem } from '../types';

export interface CalculatedVehicleTaxItem {
  item: OperationVehicleItem;
  sellingPrice: number;
  taxRatePercent: number;
  taxLabel: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  taxCode: 'S' | 'E' | 'AE' | 'Z'; // Standard, Exempt/0%, Reverse Charge, Zero rated
}

export interface DocumentTaxCalculationResult {
  items: CalculatedVehicleTaxItem[];
  totalNet: number;
  totalTax: number;
  totalGross: number;
  depositAmount: number;
  remainingAmount: number;
  taxBreakdown: {
    ratePercent: number;
    label: string;
    netBase: number;
    taxAmount: number;
  }[];
  isExport: boolean;
  isEuExport: boolean;
  isDrittlandExport: boolean;
  isDiff25aOnly: boolean;
  isStandard19Only: boolean;
  hasMixedTaxation: boolean;
  mandatoryLegalParagraphs: string[];
}

export const LEGAL_TEXT_EU_EXPORT = 
  'Steuerfreie innergemeinschaftliche Lieferung gem. § 4 Nr. 1b UStG i.V.m. § 6a UStG. Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge). Die Verpflichtung zur Vorlage der Gelangensbestätigung (Movement Certificate / Confirmation of Arrival) gilt als vereinbart.';

export const LEGAL_TEXT_EXPORT_DRITTLAND = 
  'Steuerfreie Ausfuhrlieferung gem. § 4 Nr. 1a UStG i.V.m. § 6 UStG in das Drittland. Der Ausfuhrnachweis erfolgt über den elektronischen Ausgangsvermerk des Ausfuhrzollamtes (ATLAS-Verfahren / MRN).';

export const LEGAL_TEXT_DIFF_25A = 
  'Gebrauchtgegenstände / Sonderregelung nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen.';

export const LEGAL_TEXT_ERECHNUNG = 
  'Elektronische Rechnung gem. EU-Norm EN 16931 und E-Rechnungsverordnung (E-RechV). Die strukturierte XML-Rechnungsdatei ist im Beleg eingebettet.';

export function calculateDocumentTaxes(
  documentType: OperationDocumentType,
  vehicles: OperationVehicleItem[],
  depositAmount: number = 0,
  customNotes?: string,
  customVatRate?: number
): DocumentTaxCalculationResult {
  const vatRate = typeof customVatRate === 'number' && customVatRate >= 0 ? customVatRate : 19;
  const vatMultiplier = 1 + vatRate / 100;
  const isEuExport = documentType === 'eu_export';
  const isDrittlandExport = documentType === 'export_drittland';
  const isExport = isEuExport || isDrittlandExport;

  let totalNet = 0;
  let totalTax = 0;
  let totalGross = 0;

  const calculatedItems: CalculatedVehicleTaxItem[] = vehicles.map(v => {
    const sellingPrice = Math.max(0, Number(v.sellingPrice) || 0);

    // If vehicle is diff_25a (Differenzbesteuerung), it ALWAYS stays § 25a even if EU or Drittland export was selected
    if (v.taxType === 'diff_25a') {
      const net = sellingPrice;
      const tax = 0;
      const gross = sellingPrice;
      totalNet += net;
      totalTax += tax;
      totalGross += gross;

      return {
        item: v,
        sellingPrice,
        taxRatePercent: 0,
        taxLabel: '§ 25a UStG (Differenz)',
        netAmount: net,
        taxAmount: tax,
        grossAmount: gross,
        taxCode: 'Z'
      };
    }

    // If EU Export or Drittland Export -> 0% Tax (Netto = Brutto) for standard VAT vehicles
    if (isExport) {
      const net = sellingPrice;
      const tax = 0;
      const gross = sellingPrice;
      totalNet += net;
      totalTax += tax;
      totalGross += gross;

      return {
        item: v,
        sellingPrice,
        taxRatePercent: 0,
        taxLabel: isEuExport ? '0% § 4 Nr. 1b UStG (EU)' : '0% § 4 Nr. 1a UStG (Drittland)',
        netAmount: net,
        taxAmount: tax,
        grossAmount: gross,
        taxCode: isEuExport ? 'AE' : 'E'
      };
    }

    // Standard or Angebot or Rechnung or E-Rechnung or Kaufvertrag
    if (v.taxType === 'standard_19') {
      const net = vatMultiplier > 0 ? sellingPrice / vatMultiplier : sellingPrice;
      const tax = sellingPrice - net;
      const gross = sellingPrice;
      totalNet += net;
      totalTax += tax;
      totalGross += gross;

      return {
        item: v,
        sellingPrice,
        taxRatePercent: vatRate,
        taxLabel: `${vatRate}% MwSt.`,
        netAmount: net,
        taxAmount: tax,
        grossAmount: gross,
        taxCode: 'S'
      };
    } else {
      // 0% / Other Exempt
      const net = sellingPrice;
      const tax = 0;
      const gross = sellingPrice;
      totalNet += net;
      totalTax += tax;
      totalGross += gross;

      return {
        item: v,
        sellingPrice,
        taxRatePercent: 0,
        taxLabel: '0% Steuerfrei',
        netAmount: net,
        taxAmount: tax,
        grossAmount: gross,
        taxCode: 'E'
      };
    }
  });

  const remainingAmount = Math.max(0, totalGross - depositAmount);

  // Build tax breakdowns
  const breakdownMap = new Map<string, { ratePercent: number; label: string; netBase: number; taxAmount: number }>();
  calculatedItems.forEach(ci => {
    const existing = breakdownMap.get(ci.taxLabel);
    if (existing) {
      existing.netBase += ci.netAmount;
      existing.taxAmount += ci.taxAmount;
    } else {
      breakdownMap.set(ci.taxLabel, {
        ratePercent: ci.taxRatePercent,
        label: ci.taxLabel,
        netBase: ci.netAmount,
        taxAmount: ci.taxAmount
      });
    }
  });

  const taxBreakdown = Array.from(breakdownMap.values());

  const hasDiff25a = calculatedItems.some(i => i.item.taxType === 'diff_25a');
  const hasStandard19 = calculatedItems.some(i => i.item.taxType === 'standard_19');
  const isDiff25aOnly = hasDiff25a && !hasStandard19 && !isExport;
  const isStandard19Only = hasStandard19 && !hasDiff25a && !isExport;
  const hasMixedTaxation = hasDiff25a && hasStandard19 && !isExport;

  // Build mandatory legal paragraphs list
  const mandatoryLegalParagraphs: string[] = [];

  if (hasDiff25a) {
    // If vehicle is diff_25a, always show § 25a paragraph and override export paragraphs
    mandatoryLegalParagraphs.push(LEGAL_TEXT_DIFF_25A);
  } else if (isEuExport) {
    mandatoryLegalParagraphs.push(LEGAL_TEXT_EU_EXPORT);
  } else if (isDrittlandExport) {
    mandatoryLegalParagraphs.push(LEGAL_TEXT_EXPORT_DRITTLAND);
  }

  if (documentType === 'e_rechnung') {
    mandatoryLegalParagraphs.push(LEGAL_TEXT_ERECHNUNG);
  }

  if (customNotes && customNotes.trim()) {
    mandatoryLegalParagraphs.push(customNotes.trim());
  }

  return {
    items: calculatedItems,
    totalNet,
    totalTax,
    totalGross,
    depositAmount,
    remainingAmount,
    taxBreakdown,
    isExport,
    isEuExport,
    isDrittlandExport,
    isDiff25aOnly,
    isStandard19Only,
    hasMixedTaxation,
    mandatoryLegalParagraphs
  };
}
