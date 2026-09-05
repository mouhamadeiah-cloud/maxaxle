/**
 * KBA (Kraftfahrt-Bundesamt) HSN / TSN Master Automotive Database & Type Registry
 * 
 * Unified reference for all 61,294 official German vehicle records.
 * Optimized compact indexed registry with 0ms deterministic lookup.
 */

import kbaMasterDataset from './kbaDatabase.json';

export interface HsnTsnRecord {
  hsn: string; // 4-digit Herstellerschlüsselnummer (e.g. "0005")
  tsn: string; // 3-8 character Typschlüsselnummer (e.g. "CSX", "BMN", "AAK")
  brand: string;
  model: string;
  variant?: string;
  powerKw: number;
  powerPs: number;
  displacementCc: number;
  fuelType: string;
  bodyType: string;
  transmission: string;
  emissionClass: string;
  doors?: string;
  seats?: string;
  co2Emissions?: string;
  hsnTsnFormatted?: string;
}

/**
 * Manufacturer HSN (4-digit) Master Reference Directory (Without country flags)
 */
export const KBA_MANUFACTURERS: Record<string, { brand: string; country: string }> = {
  '0005': { brand: 'BMW', country: 'Deutschland' },
  '0588': { brand: 'Audi', country: 'Deutschland' },
  '0603': { brand: 'Volkswagen', country: 'Deutschland' },
  '0600': { brand: 'Volkswagen', country: 'Deutschland' },
  '1313': { brand: 'Mercedes-Benz', country: 'Deutschland' },
  '0999': { brand: 'Mercedes-Benz', country: 'Deutschland' },
  '0708': { brand: 'Mercedes-Benz', country: 'Deutschland' },
  '0710': { brand: 'Mercedes-Benz', country: 'Deutschland' },
  '0583': { brand: 'Porsche', country: 'Deutschland' },
  '8566': { brand: 'Ford', country: 'Deutschland / USA' },
  '0035': { brand: 'Opel', country: 'Deutschland' },
  '1844': { brand: 'Opel', country: 'Deutschland' },
  '8004': { brand: 'Skoda', country: 'Tschechien' },
  '7593': { brand: 'Seat', country: 'Spanien' },
  '3333': { brand: 'Renault', country: 'Frankreich' },
  '3003': { brand: 'Peugeot', country: 'Frankreich' },
  '3004': { brand: 'Citroen', country: 'Frankreich' },
  '2143': { brand: 'DS Automobiles', country: 'Frankreich' },
  '5013': { brand: 'Toyota', country: 'Japan' },
  '5048': { brand: 'Lexus', country: 'Japan' },
  '1349': { brand: 'Hyundai', country: 'Südkorea' },
  '8253': { brand: 'Kia', country: 'Südkorea' },
  '9101': { brand: 'Volvo', country: 'Schweden' },
  '1480': { brand: 'Tesla', country: 'USA' },
  '4136': { brand: 'Fiat', country: 'Italien' },
  '4001': { brand: 'Alfa Romeo', country: 'Italien' },
  '1004': { brand: 'Mazda', country: 'Japan' },
  '7118': { brand: 'Nissan', country: 'Japan' },
  '9891': { brand: 'Land Rover', country: 'Großbritannien' },
  '2055': { brand: 'Jaguar', country: 'Großbritannien' },
  '7909': { brand: 'Mini', country: 'Großbritannien / Deutschland' },
  '7967': { brand: 'Smart', country: 'Deutschland' },
  '1590': { brand: 'Polestar', country: 'Schweden' },
  '8307': { brand: 'Dacia', country: 'Rumänien' },
  '7107': { brand: 'Mitsubishi', country: 'Japan' },
  '7102': { brand: 'Honda', country: 'Japan' },
  '7106': { brand: 'Subaru', country: 'Japan' },
  '2131': { brand: 'Cupra', country: 'Spanien' },
  '1005': { brand: 'Jeep', country: 'USA' }
};

export interface HsnTsnLookupResult {
  found: boolean;
  matchType: 'exact' | 'manufacturer' | 'none';
  record?: HsnTsnRecord;
  manufacturer?: { brand: string; country: string };
  message: string;
}

/**
 * Standardize HSN code to 4-digit format (e.g. "5" -> "0005")
 */
export function normalizeHsn(rawHsn: string): string {
  if (!rawHsn) return '';
  const cleaned = rawHsn.trim().replace(/[^0-9a-zA-Z]/g, '');
  if (!cleaned) return '';
  if (/^\d+$/.test(cleaned) && cleaned.length < 4) {
    return cleaned.padStart(4, '0');
  }
  return cleaned.toUpperCase();
}

/**
 * Standardize TSN code (3-8 characters, uppercase, stripped)
 */
export function normalizeTsn(rawTsn: string): string {
  if (!rawTsn) return '';
  const cleaned = rawTsn.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  return cleaned;
}

/**
 * Fast O(1) in-memory record resolution
 */
function tupleToRecord(hsn: string, tsn: string, tuple: any[]): HsnTsnRecord {
  const brand = tuple[0] || '';
  const model = tuple[1] || '';
  const powerPs = Number(tuple[2]) || 0;
  const powerKw = Number(tuple[3]) || 0;
  const displacementCc = Number(tuple[4]) || 0;
  const fuelType = tuple[5] || '';
  const transmission = tuple[6] || '';
  const bodyType = tuple[7] || '';
  const emissionClass = tuple[8] || '';
  const variant = tuple[9] || '';

  return {
    hsn,
    tsn,
    brand,
    model,
    variant,
    powerKw,
    powerPs,
    displacementCc,
    fuelType,
    bodyType,
    transmission,
    emissionClass,
    hsnTsnFormatted: `${hsn} / ${tsn}`
  };
}

/**
 * Deterministic local KBA Lookup (0ms, 100% offline, zero AI)
 */
export function lookupHsnTsn(rawHsn: string, rawTsn: string): HsnTsnLookupResult {
  const normHsn = normalizeHsn(rawHsn);
  const normTsn = normalizeTsn(rawTsn);

  if (!normHsn) {
    return {
      found: false,
      matchType: 'none',
      message: 'Bitte geben Sie eine 4-stellige HSN (Herstellerschlüssel) an.'
    };
  }

  const lookupTable = (kbaMasterDataset as any)?.lookup || {};

  // 1. Exact direct O(1) lookup
  if (normTsn) {
    const directKey = `${normHsn}_${normTsn}`;
    let matchTuple = lookupTable[directKey];

    // Try 3-character root if not found
    if (!matchTuple && normTsn.length > 3) {
      matchTuple = lookupTable[`${normHsn}_${normTsn.slice(0, 3)}`];
    }

    // Try 3-digit padded
    if (!matchTuple && /^\d+$/.test(normTsn)) {
      matchTuple = lookupTable[`${normHsn}_${normTsn.padStart(3, '0')}`];
    }

    if (matchTuple && Array.isArray(matchTuple)) {
      const record = tupleToRecord(normHsn, normTsn, matchTuple);
      const cleanBrand = record.brand && record.brand !== '0' ? record.brand : 'Unbekannt';
      const cleanModel = record.model && record.model !== '0' ? record.model : '';
      const specsInfo = record.powerPs && record.powerPs > 0 ? ` (${record.powerPs} PS / ${record.powerKw} kW)` : '';
      return {
        found: true,
        matchType: 'exact',
        record,
        message: `KBA-Register: ${cleanBrand} ${cleanModel}${specsInfo}`
      };
    }
  }

  // 2. Check if manufacturer HSN is recognized in KBA HSN map or table
  const kbaHsnBrand = (kbaMasterDataset as any)?.hsnMap?.[normHsn];
  const mfg = KBA_MANUFACTURERS[normHsn] || (kbaHsnBrand ? { brand: kbaHsnBrand, country: 'International' } : null);
  if (mfg) {
    return {
      found: true,
      matchType: 'manufacturer',
      manufacturer: mfg,
      message: `Hersteller erkannt: ${mfg.brand} (${mfg.country}). Modell kann gewählt werden.`
    };
  }

  return {
    found: false,
    matchType: 'none',
    message: `Kein Datensatz für HSN "${normHsn}" ${normTsn ? '/ TSN "' + normTsn + '"' : ''} im KBA-Register gefunden.`
  };
}

// --------------------------------------------------------------------------
// IN-MEMORY INDEXING OF KBA BRANDS AND MODELS (0ms AUTOCOMPLETE & SUGGESTIONS)
// --------------------------------------------------------------------------

const POPULAR_BRANDS_SET = new Set([
  'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Opel', 'Ford', 
  'Skoda', 'Seat', 'Cupra', 'Renault', 'Peugeot', 'Citroen', 'Toyota', 
  'Hyundai', 'Kia', 'Volvo', 'Tesla', 'Fiat', 'Mazda', 'Nissan', 'Mini', 
  'Smart', 'Land Rover', 'Jaguar', 'Dacia', 'Honda', 'Mitsubishi', 'Alfa Romeo',
  'Jeep', 'Subaru', 'Polestar', 'MAN', 'Iveco'
]);

interface KbaBrandMeta {
  brand: string;
  modelCount: number;
  isPopular: boolean;
}

let cachedKbaBrands: KbaBrandMeta[] | null = null;
const cachedBrandToModelsMap = new Map<string, string[]>();

function cleanModelToken(token: string): string {
  if (!token) return '';
  let s = token.trim();
  s = s.replace(/^[-./\s]+/, '').replace(/[-./\s]+$/, '');
  if (s.length < 2 && !/^[A-Z0-9]$/i.test(s)) return '';
  if (/^[.\-_/]+$/.test(s)) return '';
  if (s === 'UNBEKANNT' || s === 'UNVOLLSTAENDIG' || s === '0') return '';
  return s;
}

function initKbaIndex() {
  if (cachedKbaBrands) return;

  const rawLookup = (kbaMasterDataset as any)?.lookup || {};
  const rawHsnMap = (kbaMasterDataset as any)?.hsnMap || {};

  const brandModelsSet = new Map<string, Set<string>>();

  // Extract from all 61,294 entries
  for (const [_, val] of Object.entries(rawLookup)) {
    const [brand, rawModel] = Array.isArray(val) ? val : ['', val as string];
    if (!brand || typeof brand !== 'string') continue;

    const bName = brand.trim();
    if (!brandModelsSet.has(bName)) {
      brandModelsSet.set(bName, new Set<string>());
    }

    if (rawModel && typeof rawModel === 'string' && rawModel !== '0') {
      const parts = rawModel.split(/[,/]/);
      for (const part of parts) {
        const cleaned = cleanModelToken(part);
        if (cleaned) {
          brandModelsSet.get(bName)!.add(cleaned);
        }
      }
      const fullCleaned = cleanModelToken(rawModel);
      if (fullCleaned && fullCleaned.length <= 40) {
        brandModelsSet.get(bName)!.add(fullCleaned);
      }
    }
  }

  // Also ensure all brands from HSN map are present
  for (const brand of Object.values(rawHsnMap)) {
    if (brand && typeof brand === 'string') {
      const bName = (brand as string).trim();
      if (!brandModelsSet.has(bName)) {
        brandModelsSet.set(bName, new Set<string>());
      }
    }
  }

  // Pre-sort models for every brand
  for (const [bName, set] of brandModelsSet.entries()) {
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
    cachedBrandToModelsMap.set(bName.toLowerCase(), sorted);
  }

  // Build brand list with popular brands first or alphabetized
  const allBrands: KbaBrandMeta[] = Array.from(brandModelsSet.entries()).map(([brand, set]) => ({
    brand,
    modelCount: set.size,
    isPopular: POPULAR_BRANDS_SET.has(brand)
  }));

  allBrands.sort((a, b) => {
    // Popular brands first, then alphabetical
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.brand.localeCompare(b.brand, 'de');
  });

  cachedKbaBrands = allBrands;
}

/**
 * Returns all unique vehicle brands derived directly from kbaDatabase.json
 */
export function getAllKbaBrands(): KbaBrandMeta[] {
  initKbaIndex();
  return cachedKbaBrands || [];
}

/**
 * Returns all model variants for a brand directly from kbaDatabase.json
 */
export function getKbaModelsForBrand(brandName: string): string[] {
  if (!brandName || !brandName.trim()) return [];
  initKbaIndex();

  const key = brandName.trim().toLowerCase();
  
  // Exact match
  if (cachedBrandToModelsMap.has(key)) {
    return cachedBrandToModelsMap.get(key) || [];
  }

  // Partial match fallback
  for (const [bKey, models] of cachedBrandToModelsMap.entries()) {
    if (bKey.includes(key) || key.includes(bKey)) {
      return models;
    }
  }

  return [];
}

