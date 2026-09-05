import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

console.log('=== Building Single Canonical KBA Database (kbaDatabase.json) ===');

const excelPath = path.resolve('src/data/hsn-tsn.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error('Source excel not found at:', excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets['FZ 6.1'] || workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Loaded ${rows.length} rows from official Excel.`);

function sanitizeText(raw) {
  if (!raw && raw !== 0) return '';
  let s = String(raw);
  s = s.replace(/[\u00B4\u2018\u2019\u0060\u2032]/g, "'");
  s = s.replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"');
  s = s.replace(/\u00B2/g, '2');
  s = s.replace(/\u00B3/g, '3');
  s = s.replace(/\u2013|\u2014/g, '-');
  s = s.replace(/[\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\uFEFF\u00AD]/g, ' ');
  s = s.replace(/[\x00-\x1F\x7F-\x9F\uFFFD]/g, '');
  s = s.normalize('NFC');
  s = s.replace(/;+/g, ' / ').replace(/\s+/g, ' ').trim();
  return s;
}

function cleanBrandName(raw) {
  if (!raw) return '';
  const s = sanitizeText(raw);
  const upper = s.toUpperCase();

  if (upper.includes('VOLKSWAGEN') || upper.includes('VW')) return 'Volkswagen';
  if (upper.includes('BAYER.MOT') || upper.includes('BMW')) return 'BMW';
  if (
    upper.includes('MERCEDES') ||
    upper.includes('DAIMLER-BENZ') ||
    upper.includes('DAIMLERCHRYSLER') ||
    upper.includes('DAIMLER (D)') ||
    upper.includes('DAIMLER AG') ||
    upper.includes('MERCEDES-BENZ')
  ) return 'Mercedes-Benz';
  if (upper === 'AUDI' || upper.startsWith('AUDI ')) return 'Audi';
  if (upper.includes('PORSCHE')) return 'Porsche';
  if (upper.includes('OPEL')) return 'Opel';
  if (upper.includes('FORD')) return 'Ford';
  if (upper.includes('SKODA') || upper.includes('ŠKODA')) return 'Skoda';
  if (upper.includes('SEAT') || upper.includes('CUPRA')) return 'Seat';
  if (upper.includes('RENAULT')) return 'Renault';
  if (upper.includes('PEUGEOT')) return 'Peugeot';
  if (upper.includes('CITROEN') || upper.includes('CITROËN')) return 'Citroen';
  if (upper.includes('FIAT') || upper.includes('FCA ITALY')) return 'Fiat';
  if (upper.includes('TOYOTA')) return 'Toyota';
  if (upper.includes('LEXUS')) return 'Lexus';
  if (upper.includes('HYUNDAI')) return 'Hyundai';
  if (upper.includes('KIA')) return 'Kia';
  if (upper.includes('VOLVO')) return 'Volvo';
  if (upper.includes('MAZDA')) return 'Mazda';
  if (upper.includes('NISSAN')) return 'Nissan';
  if (upper.includes('HONDA')) return 'Honda';
  if (upper.includes('SUZUKI')) return 'Suzuki';
  if (upper.includes('MITSUBISHI')) return 'Mitsubishi';
  if (upper.includes('TESLA')) return 'Tesla';
  if (upper.includes('LAND ROVER')) return 'Land Rover';
  if (upper.includes('JAGUAR')) return 'Jaguar';
  if (upper.includes('MINI')) return 'Mini';
  if (upper.includes('ALFA ROMEO')) return 'Alfa Romeo';
  if (upper.includes('JEEP')) return 'Jeep';
  if (upper.includes('DACIA')) return 'Dacia';
  if (upper.includes('SMART')) return 'Smart';
  if (upper.includes('SUBARU')) return 'Subaru';
  if (upper.includes('FERRARI')) return 'Ferrari';
  if (upper.includes('LAMBORGHINI')) return 'Lamborghini';
  if (upper.includes('MASERATI')) return 'Maserati';
  if (upper.includes('ASTON MARTIN')) return 'Aston Martin';
  if (upper.includes('BENTLEY')) return 'Bentley';
  if (upper.includes('ROLLS-ROYCE') || upper.includes('ROLLS ROYCE')) return 'Rolls-Royce';
  if (upper.includes('CHEVROLET')) return 'Chevrolet';
  if (upper.includes('DODGE')) return 'Dodge';
  if (upper.includes('CHRYSLER')) return 'Chrysler';
  if (upper.includes('CADILLAC')) return 'Cadillac';
  if (upper.includes('MAN')) return 'MAN';
  if (upper.includes('SCANIA')) return 'Scania';
  if (upper.includes('IVECO')) return 'Iveco';
  if (upper.includes('ABARTH')) return 'Abarth';
  if (upper.includes('ALPINA')) return 'Alpina';
  if (upper.includes('DS AUTOMOBILES') || upper.includes('DS ')) return 'DS Automobiles';
  if (upper.includes('POLESTAR')) return 'Polestar';
  if (upper.includes('GENESIS')) return 'Genesis';
  if (upper.includes('MG ROVER') || upper.includes('MG ')) return 'MG';
  if (upper.includes('SAAB')) return 'Saab';
  if (upper.includes('LANCIA')) return 'Lancia';

  return s.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function cleanModelName(raw) {
  if (!raw || raw === 'UNBEKANNT' || raw === 'UNVOLLSTAENDIG' || raw === '0') return '';
  return sanitizeText(raw);
}

const lookup = {};
const hsnMap = {};

for (let i = 8; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;

  const rawHsn = row[1] ? String(row[1]).trim() : '';
  const rawBrand = row[2] ? String(row[2]).trim() : '';
  const rawTsn = row[3] ? String(row[3]).trim().toUpperCase() : '';
  const rawModel = row[4] ? String(row[4]).trim() : '';

  if (!rawHsn || rawHsn.includes('Hersteller') || rawHsn.includes('schlüssel')) continue;

  const normHsn = /^\d+$/.test(rawHsn) && rawHsn.length < 4 ? rawHsn.padStart(4, '0') : rawHsn;
  const brand = cleanBrandName(rawBrand);
  const model = cleanModelName(rawModel);

  if (normHsn && brand) {
    if (!hsnMap[normHsn]) {
      hsnMap[normHsn] = brand;
    }

    if (rawTsn) {
      const key = `${normHsn}_${rawTsn}`;
      // Store compact [brand, model] tuple
      lookup[key] = [brand, model];

      if (rawTsn.length > 3) {
        const rootKey = `${normHsn}_${rawTsn.slice(0, 3)}`;
        if (!lookup[rootKey]) {
          lookup[rootKey] = [brand, model];
        }
      }
    }
  }
}

const kbaDb = {
  version: '2026-KBA-Official',
  totalExactEntries: Object.keys(lookup).length,
  totalHsns: Object.keys(hsnMap).length,
  hsnMap,
  lookup
};

const kbaDbPath = path.resolve('src/data/kbaDatabase.json');
fs.writeFileSync(kbaDbPath, JSON.stringify(kbaDb), 'utf8');

console.log('[SUCCESS] Created single unified KBA database:');
console.log(`- kbaDatabase.json: ${Object.keys(lookup).length} lookup entries, ${Object.keys(hsnMap).length} brands (${(fs.statSync(kbaDbPath).size / 1024 / 1024).toFixed(2)} MB)`);
