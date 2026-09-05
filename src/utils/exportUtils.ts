import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Vehicle, Customer } from '../types';

/**
 * Format timestamp / date helper
 */
const getFormattedDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getTimestampFilenamePart = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Map status key to German label
 */
const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'verfuegbar':
      return 'Verfügbar';
    case 'reserviert':
      return 'Reserviert';
    case 'aufbereitung':
      return 'In Aufbereitung';
    case 'verkauft':
      return 'Verkauft';
    default:
      return status || 'Unbekannt';
  }
};

const getTaxTypeLabel = (taxType?: string): string => {
  switch (taxType) {
    case 'diff_25a':
      return '§ 25a Differenz';
    case 'standard_19':
      return '19% MwSt.';
    default:
      return taxType || '—';
  }
};

// ============================================================================
// 1. VEHICLE EXPORTS (CSV, PDF & EXCEL)
// ============================================================================

const escapeCsvCell = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportVehiclesToCsv = (vehicles: Vehicle[], customTitle = 'Fahrzeugbestand') => {
  if (!vehicles || vehicles.length === 0) {
    alert('Keine Fahrzeuge zum Exportieren vorhanden.');
    return;
  }

  const headers = [
    'Nr.',
    'Marke',
    'Modell',
    'Variante / Paket',
    'FIN',
    'Erstzulassung',
    'Kilometerstand (km)',
    'Verkaufspreis (€)',
    'Einkaufspreis (€)',
    'Status',
    'Besteuerung',
    'Kraftstoff',
    'Getriebe',
    'Leistung (PS)',
    'Farbe',
    'Standort',
    'Erfasst am'
  ];

  const rows = vehicles.map((v, idx) => [
    idx + 1,
    v.brand || '',
    v.model || '',
    v.variant || '',
    v.vin || '',
    v.firstRegistration || '',
    v.mileage || 0,
    v.sellingPrice ? v.sellingPrice.toFixed(2).replace('.', ',') : '0,00',
    v.purchasePrice ? v.purchasePrice.toFixed(2).replace('.', ',') : '0,00',
    getStatusLabel(v.status),
    getTaxTypeLabel(v.taxType),
    v.fuelType || '',
    v.transmission || '',
    v.powerPs || '',
    v.color || '',
    v.location || '',
    v.createdAt ? new Date(v.createdAt).toLocaleDateString('de-DE') : ''
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map(row => row.map(escapeCsvCell).join(';'))
  ].join('\r\n');

  // UTF-8 BOM for German characters and Excel auto-encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${customTitle.replace(/\s+/g, '_')}_${getTimestampFilenamePart()}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportVehiclesToExcel = (vehicles: Vehicle[], customTitle = 'Fahrzeugbestand') => {
  if (!vehicles || vehicles.length === 0) {
    alert('Keine Fahrzeuge zum Exportieren vorhanden.');
    return;
  }

  const rows = vehicles.map((v, idx) => ({
    'Nr.': idx + 1,
    'Marke': v.brand || '',
    'Modell': v.model || '',
    'Variante / Paket': v.variant || '',
    'FIN': v.vin || '',
    'Erstzulassung': v.firstRegistration || '',
    'Kilometerstand (km)': v.mileage || 0,
    'Verkaufspreis (€)': v.sellingPrice || 0,
    'Einkaufspreis (€)': v.purchasePrice || 0,
    'Status': getStatusLabel(v.status),
    'Besteuerung': getTaxTypeLabel(v.taxType),
    'Kraftstoff': v.fuelType || '',
    'Getriebe': v.transmission || '',
    'Leistung (PS)': v.powerPs || '',
    'Farbe': v.color || '',
    'Standort': v.location || '',
    'Erfasst am': v.createdAt ? new Date(v.createdAt).toLocaleDateString('de-DE') : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mein Lager');

  // Auto column widths
  const maxProps = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String((r as any)[key] || '').length)) + 3
  }));
  worksheet['!cols'] = maxProps;

  const filename = `${customTitle.replace(/\s+/g, '_')}_${getTimestampFilenamePart()}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

export const exportVehiclesToPdf = (vehicles: Vehicle[], filterDescription = 'Aktuelle Filterauswahl') => {
  if (!vehicles || vehicles.length === 0) {
    alert('Keine Fahrzeuge zum Exportieren vorhanden.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(2, 29, 21); // #021d15
  doc.rect(0, 0, 297, 26, 'F');

  // Emerald accent bar
  doc.setFillColor(16, 185, 129); // #10b981
  doc.rect(0, 26, 297, 1.5, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FAHRZEUGBESTAND — MEIN LAGER', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // Emerald
  doc.text(`Exportdatum: ${getFormattedDateString()} | Datensätze: ${vehicles.length} Fahrzeuge`, 14, 20);

  // Filter description note
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Filterkriterien: ${filterDescription}`, 14, 33);

  // Table Data
  const tableData = vehicles.map((v, idx) => [
    idx + 1,
    `${v.brand || ''} ${v.model || ''}`.trim(),
    v.vin || '—',
    v.firstRegistration || '—',
    (v.mileage || 0).toLocaleString('de-DE') + ' km',
    getStatusLabel(v.status),
    getTaxTypeLabel(v.taxType),
    (v.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
  ]);

  const totalValue = vehicles.reduce((sum, v) => sum + (v.sellingPrice || 0), 0);

  autoTable(doc, {
    startY: 37,
    head: [['Nr.', 'Fahrzeug (Marke / Modell)', 'FIN', 'EZ', 'Kilometer', 'Status', 'Steuer', 'Verkaufspreis']],
    body: tableData,
    foot: [['', 'Gesamtbestand (Summe)', '', '', '', '', `${vehicles.length} Fzg.`, totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €']],
    theme: 'grid',
    headStyles: {
      fillColor: [2, 29, 21],
      textColor: [245, 197, 24],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [3, 35, 24],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 50, fontStyle: 'italic' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 32, halign: 'center' },
      6: { cellWidth: 35, halign: 'center' },
      7: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    }
  });

  const filename = `Fahrzeugbestand_${getTimestampFilenamePart()}.pdf`;
  doc.save(filename);
};

// ============================================================================
// 2. CUSTOMER EXPORTS (PDF & EXCEL)
// ============================================================================

export const exportCustomersToExcel = (customers: Customer[], customTitle = 'Kundenliste') => {
  if (!customers || customers.length === 0) {
    alert('Keine Kunden zum Exportieren vorhanden.');
    return;
  }

  const rows = customers.map((c, idx) => {
    const isB2B = c.type === 'B2B';
    return {
      'Nr.': idx + 1,
      'Kundentyp': isB2B ? 'Gewerbekunde (B2B)' : 'Privatkunde (B2C)',
      'Firmenname': c.companyName || '',
      'Name / Ansprechpartner': c.name || '',
      'E-Mail': c.email || '',
      'Telefon': c.phone || '',
      'Straße': c.street || '',
      'PLZ': c.postalCode || '',
      'Stadt': c.city || '',
      'Land': c.country || 'Deutschland',
      'USt-IdNr.': c.vatId || '',
      'Steuernummer': c.taxNumber || '',
      'Gekaufte Fahrzeuge': c.purchasesCount || 0,
      'Gesamtumsatz (€)': c.totalSpent || 0,
      'Letzter Kontakt': c.lastContact || '',
      'Notizen': c.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kunden');

  // Auto column widths
  const maxProps = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String((r as any)[key] || '').length)) + 3
  }));
  worksheet['!cols'] = maxProps;

  const filename = `${customTitle.replace(/\s+/g, '_')}_${getTimestampFilenamePart()}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

export const exportCustomersToPdf = (customers: Customer[], filterDescription = 'Aktuelle Filterauswahl') => {
  if (!customers || customers.length === 0) {
    alert('Keine Kunden zum Exportieren vorhanden.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(2, 29, 21); // #021d15
  doc.rect(0, 0, 297, 26, 'F');

  // Emerald accent bar
  doc.setFillColor(16, 185, 129); // #10b981
  doc.rect(0, 26, 297, 1.5, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KUNDENLISTE & STAMMDATEN', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // Emerald
  doc.text(`Exportdatum: ${getFormattedDateString()} | Datensätze: ${customers.length} Kunden`, 14, 20);

  // Filter description note
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Filterkriterien: ${filterDescription}`, 14, 33);

  // Table Data
  const tableData = customers.map((c, idx) => {
    const isB2B = c.type === 'B2B';
    const address = [c.street, c.postalCode, c.city].filter(Boolean).join(', ') || '—';
    const displayName = isB2B && c.companyName ? `${c.companyName} (${c.name})` : c.name;
    return [
      idx + 1,
      isB2B ? 'B2B Gewerbe' : 'B2C Privat',
      displayName,
      address,
      c.phone || '—',
      c.email || '—',
      c.purchasesCount || 0,
      (c.totalSpent || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
    ];
  });

  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  autoTable(doc, {
    startY: 37,
    head: [['Nr.', 'Typ', 'Kundenname / Firma', 'Anschrift', 'Telefon', 'E-Mail', 'Käufe', 'Gesamtumsatz']],
    body: tableData,
    foot: [['', '', 'Gesamtübersicht', '', '', '', `${customers.length} Kunden`, totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €']],
    theme: 'grid',
    headStyles: {
      fillColor: [2, 29, 21],
      textColor: [245, 197, 24],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [3, 35, 24],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 60, fontStyle: 'bold' },
      3: { cellWidth: 55 },
      4: { cellWidth: 32 },
      5: { cellWidth: 42 },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    }
  });

  const filename = `Kundenliste_${getTimestampFilenamePart()}.pdf`;
  doc.save(filename);
};

// ============================================================================
// 3. FINANCIAL TRANSACTIONS EXPORT (DATEV / CSV & PDF)
// ============================================================================

export const exportFinancialTransactionsToCsv = (transactions: any[], filenamePrefix = 'Finanzbuch_DATEV'): void => {
  const headers = [
    'Beleg-Nr.',
    'Konto',
    'Datum/Uhrzeit',
    'Kategorie',
    'Buchungstext',
    'Steuersatz',
    'Betrag (EUR)',
    'Saldo danach (EUR)',
    'Status (Festschreibung)',
    'Festgeschrieben am',
    'Erfasser'
  ];

  const rows = transactions.map((t) => [
    escapeCsvCell(t.receiptNumber),
    escapeCsvCell(t.account || 'Kasse'),
    escapeCsvCell(t.timestamp),
    escapeCsvCell(t.category),
    escapeCsvCell(t.description),
    escapeCsvCell(t.taxRate || '0% (§ 25a)'),
    escapeCsvCell((t.amount || 0).toFixed(2).replace('.', ',')),
    escapeCsvCell((t.balanceAfter || 0).toFixed(2).replace('.', ',')),
    escapeCsvCell(t.locked ? 'Festgeschrieben (GoBD)' : 'Entwurf / Offen'),
    escapeCsvCell(t.lockedAt ? new Date(t.lockedAt).toLocaleString('de-DE') : '—'),
    escapeCsvCell(t.recordedBy || 'System')
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${getTimestampFilenamePart()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportFinancialTransactionsToPdf = (transactions: any[], filterDescription = 'Alle Buchungen'): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFontSize(16);
  doc.setTextColor(14, 38, 75);
  doc.text('Finanzjournal & Kassenbuch (GoBD)', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Erstellt am: ${getFormattedDateString()} | ${transactions.length} Buchungen (GoBD-festgeschrieben)`, 14, 25);
  doc.text(`Filter / Status: ${filterDescription}`, 14, 31);

  const tableData = transactions.map((t) => [
    t.receiptNumber,
    t.account || 'Kasse',
    t.timestamp,
    t.category,
    t.description,
    t.taxRate || '—',
    (t.amount >= 0 ? '+' : '') + (t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €',
    (t.balanceAfter || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €',
    t.locked ? 'Festgeschrieben' : 'Offen',
    t.recordedBy || '—'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Beleg-Nr.', 'Konto', 'Datum/Zeit', 'Kategorie', 'Buchungstext', 'Steuer', 'Betrag', 'Saldo', 'Status', 'Erfasser']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 38, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248]
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 55 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 24, halign: 'center' },
      9: { cellWidth: 20 }
    }
  });

  doc.save(`Finanzjournal_${getTimestampFilenamePart()}.pdf`);
};

// ============================================================================
// 4. INVOICE EXPORTS (CSV & PDF)
// ============================================================================

export const exportInvoicesToCsv = (invoices: any[], filenamePrefix = 'Rechnungsarchiv_Export'): void => {
  const headers = [
    'Rechnungs-Nr.',
    'Datum',
    'Fälligkeitsdatum',
    'Kunde',
    'Fahrzeug',
    'FIN / Fahrgestellnummer',
    'Besteuerung',
    'Betrag Netto (€)',
    'Betrag Brutto (€)',
    'Bezahlt (€)',
    'Status',
    'Dokumententyp',
    'Bemerkungen'
  ];

  const rows = invoices.map((inv) => [
    escapeCsvCell(inv.invoiceNumber),
    escapeCsvCell(inv.date),
    escapeCsvCell(inv.dueDate || ''),
    escapeCsvCell(inv.customerName || ''),
    escapeCsvCell(inv.vehicleTitle || ''),
    escapeCsvCell(inv.vin || ''),
    escapeCsvCell(inv.taxType === 'diff_25a' ? '§ 25a Differenz' : inv.taxType === 'standard_19' ? '19% MwSt.' : inv.taxType || ''),
    escapeCsvCell(inv.amountNet !== undefined ? inv.amountNet.toFixed(2) : ''),
    escapeCsvCell(inv.amountGross !== undefined ? inv.amountGross.toFixed(2) : ''),
    escapeCsvCell(inv.amountPaid !== undefined ? inv.amountPaid.toFixed(2) : '0.00'),
    escapeCsvCell(inv.status || 'offen'),
    escapeCsvCell(inv.documentType || inv.invoiceCategory || 'rechnung'),
    escapeCsvCell(inv.notes || '')
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((row) => row.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${getTimestampFilenamePart()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportInvoicesToPdf = (invoices: any[], filterDescription = 'Alle Rechnungen'): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFontSize(16);
  doc.setTextColor(14, 38, 75);
  doc.text('Rechnungsarchiv & Belegliste', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Erstellt am: ${getFormattedDateString()} | ${invoices.length} Belege`, 14, 25);
  doc.text(`Filter / Auswahl: ${filterDescription}`, 14, 31);

  const tableData = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.date,
    inv.customerName || '—',
    inv.vehicleTitle || '—',
    inv.taxType === 'diff_25a' ? '§ 25a' : inv.taxType === 'standard_19' ? '19%' : 'Export',
    (inv.amountGross || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €',
    (inv.amountPaid || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €',
    inv.status === 'bezahlt' ? 'Bezahlt' : inv.status === 'teilbezahlt' ? 'Teilbezahlt' : inv.status === 'storniert' ? 'Storniert' : 'Offen'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Beleg-Nr.', 'Datum', 'Kunde', 'Fahrzeug', 'Steuer', 'Brutto', 'Bezahlt', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 38, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248]
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 50 },
      3: { cellWidth: 70 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 26, halign: 'right' },
      7: { cellWidth: 22, halign: 'center' }
    }
  });

  doc.save(`Rechnungsarchiv_${getTimestampFilenamePart()}.pdf`);
};

