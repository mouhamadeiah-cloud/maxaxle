/**
 * Comprehensive Vehicle Database for MaxFleet
 * Exhaustive dataset based on official Kraftfahrt-Bundesamt (KBA FZ6 2024)
 * and German/European automotive market catalog.
 * Contains all European, Asian, American, Commercial/Transporter, and Electric brands & model series.
 */

import { getKbaModelsForBrand } from './hsnTsnDatabase';

export interface VehicleBrandEntry {
  brand: string;
  country: string;
  flag?: string;
  category: 'Premium' | 'Volumen' | 'Sportwagen' | 'Elektro' | 'Luxus' | 'Nutzfahrzeuge';
  popularModels: string[];
  models: string[];
}

export const VEHICLE_DATASET: VehicleBrandEntry[] = [
  {
    brand: 'Volkswagen',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Volumen',
    popularModels: ['Golf', 'Golf Variant', 'Passat Variant', 'Tiguan', 'T-Roc', 'Transporter / Multivan', 'Crafter', 'Caddy', 'ID.4'],
    models: [
      'Amarok',
      'Arteon',
      'Arteon Shooting Brake',
      'Beetle / New Beetle',
      'Bora',
      'Caddy',
      'Caddy Maxi',
      'California',
      'Caravelle',
      'CC',
      'Corrado',
      'Crafter',
      'Eos',
      'Fox',
      'Golf',
      'Golf Variant',
      'Golf Plus',
      'Golf Sportsvan',
      'Golf GTI',
      'Golf GTD',
      'Golf GTE',
      'Golf R',
      'Golf Alltrack',
      'ID.3',
      'ID.4',
      'ID.5',
      'ID.7',
      'ID.7 Tourer',
      'ID. Buzz',
      'ID. Buzz Cargo',
      'Jetta',
      'Lupo',
      'Multivan (T6.1 / T7)',
      'Passat',
      'Passat Variant',
      'Passat Alltrack',
      'Passat CC',
      'Phaeton',
      'Polo',
      'Polo GTI',
      'Scirocco',
      'Sharan',
      'Taigo',
      'T-Cross',
      'Tiguan',
      'Tiguan Allspace',
      'Touareg',
      'Touran',
      'Transporter (T4 / T5 / T6 / T6.1 / T7)',
      'T-Roc',
      'T-Roc Cabriolet',
      'T-Roc R',
      'Up!',
      'e-Up!',
      'Vento'
    ]
  },
  {
    brand: 'Mercedes-Benz',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Premium',
    popularModels: ['C-Klasse', 'E-Klasse', 'GLC', 'A-Klasse', 'Sprinter', 'Vito / V-Klasse', 'GLE', 'CLA'],
    models: [
      'A-Klasse (W176 / W177 / Limousine)',
      'AMG GT',
      'AMG GT 4-Türer Coupé',
      'B-Klasse (W246 / W247)',
      'C-Klasse Limousine (W205 / W206)',
      'C-Klasse T-Modell (Kombi)',
      'C-Klasse Coupé',
      'C-Klasse Cabriolet',
      'C-Klasse All-Terrain',
      'Citan',
      'CL',
      'CLA Coupé',
      'CLA Shooting Brake',
      'CLC',
      'CLE Coupé',
      'CLE Cabriolet',
      'CLK',
      'CLS Coupé',
      'CLS Shooting Brake',
      'EQA',
      'EQB',
      'EQC',
      'EQE',
      'EQE SUV',
      'EQS',
      'EQS SUV',
      'EQV',
      'E-Klasse Limousine (W212 / W213 / W214)',
      'E-Klasse T-Modell (Kombi)',
      'E-Klasse Coupé',
      'E-Klasse Cabriolet',
      'E-Klasse All-Terrain',
      'G-Klasse (W463 / G 63 AMG)',
      'GL',
      'GLA',
      'GLB',
      'GLC SUV',
      'GLC Coupé',
      'GLE SUV',
      'GLE Coupé',
      'GLK',
      'GLS',
      'M-Klasse / ML',
      'R-Klasse',
      'S-Klasse Limousine (W222 / W223)',
      'S-Klasse Coupé',
      'S-Klasse Cabriolet',
      'SL',
      'SLC',
      'SLK',
      'SLS AMG',
      'Sprinter',
      'T-Klasse',
      'V-Klasse',
      'Vaneo',
      'Vito',
      'X-Klasse (Pickup)'
    ]
  },
  {
    brand: 'BMW',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Premium',
    popularModels: ['3er Touring', '3er Limousine', '5er Touring', '1er', 'X1', 'X3', 'X5', '4er Gran Coupé'],
    models: [
      '1er (F20 / F40 / 116d / 118i / 120d / M135i)',
      '2er Coupé (G42 / M240i)',
      '2er Gran Coupé (F44)',
      '2er Active Tourer (F45 / U06)',
      '2er Gran Tourer (F46)',
      '3er Limousine (F30 / G20 / 320d / 330i / M340i)',
      '3er Touring (F31 / G21 / 320d / 330d / M340i)',
      '3er Gran Turismo (GT)',
      '4er Coupé (F32 / G22)',
      '4er Cabrio (F33 / G23)',
      '4er Gran Coupé (F36 / G26)',
      '5er Limousine (F10 / G30 / G60 / 520d / 530d / 540i)',
      '5er Touring (F11 / G31 / G61)',
      '5er Gran Turismo (GT)',
      '6er Coupé / Cabrio / Gran Coupé',
      '6er Gran Turismo (G32)',
      '7er Limousine (G11 / G70)',
      '8er Coupé / Cabrio / Gran Coupé (G14 / G15 / G16)',
      'i3',
      'i4 Gran Coupé',
      'i5 Limousine / i5 Touring',
      'i7',
      'i8',
      'iX1',
      'iX2',
      'iX3',
      'iX',
      'M2 (F87 / G87)',
      'M3 Limousine / Touring (G80 / G81)',
      'M4 Coupé / Cabrio (G82 / G83)',
      'M5 Limousine / Touring (F90 / G90 / G99)',
      'M8 Coupé / Cabrio / Gran Coupé',
      'X1 (E84 / F48 / U11)',
      'X2 (F39 / U10)',
      'X3 (F25 / G01 / G45)',
      'X4 (F26 / G02)',
      'X5 (F15 / G05)',
      'X6 (F16 / G06)',
      'X7 (G07)',
      'XM',
      'Z3',
      'Z4 Roadster (E85 / E89 / G29)'
    ]
  },
  {
    brand: 'Audi',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Premium',
    popularModels: ['A3 Sportback', 'A4 Avant', 'A6 Avant', 'Q3', 'Q5', 'RS6 Avant', 'e-tron GT'],
    models: [
      'A1 Sportback',
      'A1 Citycarver / Allstreet',
      'A2',
      'A3 Sportback',
      'A3 Limousine',
      'A4 Limousine',
      'A4 Avant',
      'A4 allroad quattro',
      'A5 Sportback',
      'A5 Coupé',
      'A5 Cabriolet',
      'A6 Limousine',
      'A6 Avant',
      'A6 allroad quattro',
      'A7 Sportback',
      'A8 Limousine',
      'e-tron (SUV / Sportback)',
      'e-tron GT / RS e-tron GT',
      'Q2',
      'Q3',
      'Q3 Sportback',
      'Q4 e-tron',
      'Q4 Sportback e-tron',
      'Q5',
      'Q5 Sportback',
      'Q6 e-tron',
      'Q7',
      'Q8',
      'Q8 e-tron / Sportback',
      'R8 Coupé / Spyder',
      'RS3 Sportback / Limousine',
      'RS4 Avant',
      'RS5 Coupé / Sportback',
      'RS6 Avant / performance',
      'RS7 Sportback',
      'RS Q3 / Sportback',
      'RS Q8',
      'S3 Sportback / Limousine',
      'S4 Avant / Limousine',
      'S5 Sportback / Coupé',
      'S6 Avant / Limousine',
      'S7 Sportback',
      'S8',
      'SQ2',
      'SQ5 / Sportback',
      'SQ7',
      'SQ8',
      'TT Coupé / Roadster',
      'TT RS'
    ]
  },
  {
    brand: 'Ford',
    country: 'USA / Deutschland',
    flag: '🇺🇸',
    category: 'Volumen',
    popularModels: ['Transit Custom', 'Focus Turnier', 'Kuga', 'Puma', 'Fiesta', 'Ranger', 'Mustang'],
    models: [
      'B-Max',
      'Capri (Elektro)',
      'C-Max / Grand C-Max',
      'EcoSport',
      'Edge',
      'Explorer (SUV / Elektro)',
      'Fiesta',
      'Focus',
      'Focus Turnier (Kombi)',
      'Focus ST / RS',
      'Fusion',
      'Galaxy',
      'Ka / Ka+',
      'Kuga',
      'Mondeo Limousine',
      'Mondeo Turnier (Kombi)',
      'Mustang (Fastback / Convertible)',
      'Mustang Mach-E',
      'Puma',
      'Puma ST',
      'Ranger (XLT / Wildtrak)',
      'Ranger Raptor',
      'S-Max',
      'Tourneo Connect / Grand Tourneo',
      'Tourneo Courier',
      'Tourneo Custom',
      'Transit',
      'Transit Connect',
      'Transit Courier',
      'Transit Custom'
    ]
  },
  {
    brand: 'Opel',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Volumen',
    popularModels: ['Corsa', 'Astra Sports Tourer', 'Mokka', 'Grandland', 'Vivaro', 'Movano', 'Crossland'],
    models: [
      'Adam',
      'Ampera / Ampera-e',
      'Antara',
      'Astra',
      'Astra Sports Tourer (Kombi)',
      'Astra GTC',
      'Astra Electric',
      'Cascada',
      'Combo / Combo Life',
      'Combo Cargo',
      'Corsa',
      'Corsa-e (Electric)',
      'Crossland / Crossland X',
      'Frontera',
      'Grandland / Grandland X',
      'Insignia Grand Sport',
      'Insignia Sports Tourer (Kombi)',
      'Insignia Country Tourer',
      'Karl',
      'Meriva',
      'Mokka / Mokka X',
      'Mokka-e',
      'Movano',
      'Omega',
      'Tigra',
      'Vectra',
      'Vivaro',
      'Vivaro-e',
      'Zafira / Zafira Tourer',
      'Zafira Life'
    ]
  },
  {
    brand: 'Skoda',
    country: 'Tschechien',
    flag: '🇨🇿',
    category: 'Volumen',
    popularModels: ['Octavia Combi', 'Superb Combi', 'Kodiaq', 'Karoq', 'Fabia', 'Kamiq', 'Enyaq iV'],
    models: [
      'Citigo / Citigo e-iV',
      'Elroq',
      'Enyaq iV',
      'Enyaq Coupé iV',
      'Enyaq RS iV',
      'Fabia',
      'Fabia Combi',
      'Kamiq',
      'Karoq',
      'Kodiaq',
      'Kodiaq RS',
      'Octavia Limousine',
      'Octavia Combi',
      'Octavia RS / RS Combi',
      'Octavia Scout',
      'Rapid',
      'Rapid Spaceback',
      'Roomster',
      'Scala',
      'Superb Limousine',
      'Superb Combi',
      'Yeti'
    ]
  },
  {
    brand: 'SEAT',
    country: 'Spanien',
    flag: '🇪🇸',
    category: 'Volumen',
    popularModels: ['Leon Sportstourer', 'Ibiza', 'Arona', 'Ateca', 'Tarraco'],
    models: [
      'Alhambra',
      'Altea / Altea XL',
      'Arona',
      'Ateca',
      'Exeo / Exeo ST',
      'Ibiza',
      'Leon',
      'Leon Sportstourer (ST)',
      'Mii / Mii electric',
      'Tarraco',
      'Toledo'
    ]
  },
  {
    brand: 'CUPRA',
    country: 'Spanien',
    flag: '🇪🇸',
    category: 'Sportwagen',
    popularModels: ['Formentor', 'Leon Sportstourer', 'Born', 'Tavascan', 'Terramar', 'Ateca'],
    models: [
      'Ateca',
      'Born',
      'Formentor (VZ / VZ5)',
      'Leon 5-Türer',
      'Leon Sportstourer (VZ)',
      'Tavascan',
      'Terramar'
    ]
  },
  {
    brand: 'Renault',
    country: 'Frankreich',
    flag: '🇫🇷',
    category: 'Volumen',
    popularModels: ['Clio', 'Captur', 'Megane E-Tech', 'Austral', 'Master', 'Trafic', 'Kangoo'],
    models: [
      'Arkana',
      'Austral',
      'Captur',
      'Clio',
      'Espace',
      'Express',
      'Grand Scenic',
      'Kadjar',
      'Kangoo',
      'Kangoo Rapid',
      'Koleos',
      'Master',
      'Megane',
      'Megane Grandtour (Kombi)',
      'Megane E-Tech 100% elektrisch',
      'Modus',
      'Rafale',
      'Scenic',
      'Scenic E-Tech Electric',
      'Symbioz',
      'Talisman',
      'Talisman Grandtour',
      'Trafic',
      'Twingo',
      'Twingo Electric',
      'Zoe'
    ]
  },
  {
    brand: 'Peugeot',
    country: 'Frankreich',
    flag: '🇫🇷',
    category: 'Volumen',
    popularModels: ['208', '2008', '308 SW', '3008', 'Boxer', 'Expert', 'Partner / Rifter'],
    models: [
      '107',
      '108',
      '207',
      '208 / e-208',
      '2008 / e-2008',
      '307',
      '308',
      '308 SW (Kombi)',
      '308 GT / e-308',
      '3008 / e-3008',
      '407',
      '408',
      '508 Limousine',
      '508 SW (Kombi)',
      '508 PSE',
      '5008 / e-5008',
      'Boxer',
      'Expert',
      'Partner',
      'RCZ',
      'Rifter',
      'Traveller'
    ]
  },
  {
    brand: 'Citroën',
    country: 'Frankreich',
    flag: '🇫🇷',
    category: 'Volumen',
    popularModels: ['Berlingo', 'C3', 'C3 Aircross', 'C4', 'C5 Aircross', 'Jumper', 'Jumpy'],
    models: [
      'Berlingo',
      'Berlingo XL',
      'C1',
      'C2',
      'C3',
      'C3 Aircross',
      'ë-C3',
      'C4',
      'C4 X',
      'ë-C4 / ë-C4 X',
      'C4 Cactus',
      'C4 Picasso / Grand C4 Picasso',
      'C4 Spacetourer',
      'C5',
      'C5 Aircross',
      'C5 X',
      'C6',
      'C8',
      'DS3',
      'DS4',
      'DS5',
      'Jumper',
      'Jumpy',
      'Nemo',
      'Spacetourer'
    ]
  },
  {
    brand: 'Fiat',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Volumen',
    popularModels: ['500 / 500e', 'Ducato', 'Panda', 'Tipo Kombi', 'Doblò', 'Scudo'],
    models: [
      '124 Spider',
      '500',
      '500C (Cabrio)',
      '500e',
      '500L',
      '500X',
      '600 / 600e',
      'Bravo',
      'Doblò / Doblò Cargo',
      'Ducato',
      'Fiorino',
      'Freemont',
      'Grande Punto',
      'Panda',
      'Panda 4x4',
      'Punto',
      'Qubo',
      'Scudo',
      'Sedici',
      'Talento',
      'Tipo Limousine',
      'Tipo 5-Türer',
      'Tipo Kombi',
      'Tipo Cross'
    ]
  },
  {
    brand: 'Toyota',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Yaris', 'Yaris Cross', 'Corolla Touring Sports', 'RAV4', 'C-HR', 'Proace', 'Hilux'],
    models: [
      'Auris / Auris Touring Sports',
      'Avensis / Avensis Combi',
      'Aygo',
      'Aygo X',
      'bZ4X',
      'Camry',
      'C-HR',
      'Corolla',
      'Corolla Touring Sports',
      'Corolla Cross',
      'GR Yaris',
      'GR86 / GT86',
      'GR Supra',
      'Hilux',
      'Land Cruiser (Prado / V8)',
      'Prius / Prius Plug-in',
      'Proace',
      'Proace Verso',
      'Proace City',
      'Proace City Verso',
      'RAV4',
      'RAV4 Plug-in Hybrid',
      'Urban Cruiser',
      'Verso',
      'Yaris',
      'Yaris Cross'
    ]
  },
  {
    brand: 'Hyundai',
    country: 'Südkorea',
    flag: '🇰🇷',
    category: 'Volumen',
    popularModels: ['Tucson', 'i30 Kombi', 'i20', 'Kona', 'Ioniq 5', 'Staria', 'Santa Fe'],
    models: [
      'Bayon',
      'H-1 / H350',
      'i10',
      'i20',
      'i20 N',
      'i30',
      'i30 Kombi',
      'i30 Fastback',
      'i30 N / Fastback N',
      'Ioniq (Hybrid / Plug-in / Elektro)',
      'Ioniq 5 / Ioniq 5 N',
      'Ioniq 6',
      'ix20',
      'ix35',
      'Kona',
      'Kona Elektro',
      'Kona N',
      'Nexo (Wasserstoff)',
      'Santa Fe',
      'Staria',
      'Tucson'
    ]
  },
  {
    brand: 'Kia',
    country: 'Südkorea',
    flag: '🇰🇷',
    category: 'Volumen',
    popularModels: ['Ceed Sportswagon', 'Sportage', 'XCeed', 'Picanto', 'Niro', 'EV6', 'Sorento'],
    models: [
      'Carens',
      'Ceed',
      'Ceed Sportswagon',
      'EV3',
      'EV6 / EV6 GT',
      'EV9',
      'Niro / e-Niro / Niro EV',
      'Optima / Optima Sportswagon',
      'Picanto',
      'ProCeed (Shooting Brake)',
      'Rio',
      'Sorento',
      'Soul / e-Soul',
      'Sportage',
      'Stinger',
      'Stonic',
      'Venga',
      'XCeed'
    ]
  },
  {
    brand: 'Volvo',
    country: 'Schweden',
    flag: '🇸🇪',
    category: 'Premium',
    popularModels: ['XC60', 'XC40', 'V60', 'XC90', 'EX30', 'V90'],
    models: [
      'C40 Recharge',
      'EX30',
      'EX40',
      'EX90',
      'S60',
      'S90',
      'V40 / V40 Cross Country',
      'V60',
      'V60 Cross Country',
      'V90',
      'V90 Cross Country',
      'XC40 / XC40 Recharge',
      'XC60',
      'XC70',
      'XC90'
    ]
  },
  {
    brand: 'Porsche',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Sportwagen',
    popularModels: ['911 Carrera', 'Macan', 'Cayenne', 'Taycan', 'Panamera', '718 Cayman'],
    models: [
      '718 Boxster (GTS / Spyder RS)',
      '718 Cayman (GT4 / GT4 RS)',
      '911 Carrera / Cabriolet (991 / 992)',
      '911 Targa',
      '911 Turbo / Turbo S',
      '911 GT3 / GT3 RS',
      '911 Dakar',
      'Cayenne',
      'Cayenne Coupé',
      'Cayenne Turbo GT',
      'Macan',
      'Macan GTS / Turbo',
      'Macan Electric',
      'Panamera Limousine',
      'Panamera Sport Turismo',
      'Taycan',
      'Taycan 4S / Turbo / Turbo S',
      'Taycan Cross Turismo',
      'Taycan Sport Turismo'
    ]
  },
  {
    brand: 'Tesla',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Elektro',
    popularModels: ['Model Y', 'Model 3', 'Model S', 'Model X'],
    models: [
      'Cybertruck',
      'Model 3 (Standard / Long Range / Performance)',
      'Model 3 Highland',
      'Model S (Long Range / Plaid)',
      'Model X (Long Range / Plaid)',
      'Model Y (Standard / Long Range / Performance)',
      'Roadster'
    ]
  },
  {
    brand: 'Nissan',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Qashqai', 'Juke', 'X-Trail', 'Townstar', 'Primastar', 'Navara', 'Leaf'],
    models: [
      '350Z / 370Z',
      'Ariya',
      'GT-R (R35)',
      'Interstar',
      'Juke',
      'Leaf',
      'Micra',
      'Navara (King Cab / Double Cab)',
      'Note',
      'NV200 / e-NV200',
      'NV300 / NV400',
      'Pathfinder',
      'Primastar',
      'Pulsar',
      'Qashqai (e-POWER)',
      'Townstar',
      'X-Trail'
    ]
  },
  {
    brand: 'Mazda',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['CX-5', 'CX-30', 'Mazda3', 'Mazda6 Kombi', 'CX-60', 'MX-5'],
    models: [
      'CX-3',
      'CX-30',
      'CX-5',
      'CX-60',
      'CX-80',
      'Mazda2',
      'Mazda2 Hybrid',
      'Mazda3 Schrägheck',
      'Mazda3 Fastback (Limousine)',
      'Mazda6 Limousine',
      'Mazda6 Kombi',
      'MX-30 / R-EV',
      'MX-5 Roadster',
      'MX-5 RF'
    ]
  },
  {
    brand: 'Suzuki',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis'],
    models: [
      'Across',
      'Baleno',
      'Celerio',
      'Grand Vitara',
      'Ignis',
      'Jimny (Nutzfahrzeug / Allgrip)',
      'Splash',
      'Swace',
      'Swift',
      'Swift Sport',
      'SX4 / SX4 S-Cross',
      'Vitara'
    ]
  },
  {
    brand: 'Dacia',
    country: 'Rumänien',
    flag: '🇷🇴',
    category: 'Volumen',
    popularModels: ['Duster', 'Sandero Stepway', 'Jogger', 'Spring', 'Dokker'],
    models: [
      'Dokker / Dokker Express',
      'Duster (I / II / III 4x4)',
      'Jogger',
      'Lodgy',
      'Logan',
      'Logan MCV',
      'Sandero',
      'Sandero Stepway',
      'Spring Electric'
    ]
  },
  {
    brand: 'Mini',
    country: 'Großbritannien / Deutschland',
    flag: '🇬🇧',
    category: 'Premium',
    popularModels: ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Cabrio', 'JCW'],
    models: [
      '3-Türer (Cooper / Cooper S / JCW)',
      '5-Türer',
      'Aceman (Elektro)',
      'Cabrio',
      'Clubman',
      'Countryman',
      'Coupé',
      'John Cooper Works (JCW)',
      'Paceman',
      'Roadster'
    ]
  },
  {
    brand: 'Smart',
    country: 'Deutschland / China',
    flag: '🇩🇪',
    category: 'Elektro',
    popularModels: ['#1', '#3', 'Fortwo', 'Forfour'],
    models: [
      '#1 (Pro / Premium / Brabus)',
      '#3 (Pro / Premium / Brabus)',
      '#5',
      'Forfour',
      'Fortwo Coupé (450 / 451 / 453)',
      'Fortwo Cabrio',
      'Fortwo EQ (Elektro)',
      'Roadster / Coupé'
    ]
  },
  {
    brand: 'Land Rover',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Premium',
    popularModels: ['Defender 110', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Discovery Sport'],
    models: [
      'Defender 90',
      'Defender 110',
      'Defender 130',
      'Discovery',
      'Discovery Sport',
      'Freelander',
      'Range Rover (Vogue / Autobiography)',
      'Range Rover Evoque',
      'Range Rover Sport',
      'Range Rover Velar'
    ]
  },
  {
    brand: 'Jaguar',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Premium',
    popularModels: ['F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'XF Sportbrake'],
    models: [
      'E-Pace',
      'F-Pace / F-Pace SVR',
      'F-Type Coupé / Convertible',
      'I-Pace (Elektro)',
      'XE Limousine',
      'XF Limousine',
      'XF Sportbrake (Kombi)',
      'XJ Limousine',
      'XK / XKR'
    ]
  },
  {
    brand: 'Alfa Romeo',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Sportwagen',
    popularModels: ['Giulia', 'Stelvio', 'Tonale', 'Junior', 'Giulietta'],
    models: [
      '147',
      '159 / 159 Sportwagon',
      '4C / 4C Spider',
      'Brera',
      'Giulia (Super / Veloce / Quadrifoglio)',
      'Giulietta',
      'Junior (Milano)',
      'MiTo',
      'Spider',
      'Stelvio (Veloce / Quadrifoglio)',
      'Tonale'
    ]
  },
  {
    brand: 'Jeep',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Volumen',
    popularModels: ['Avenger', 'Compass', 'Renegade', 'Wrangler Rubicon', 'Grand Cherokee'],
    models: [
      'Avenger / Avenger 4xe',
      'Cherokee',
      'Commander',
      'Compass / Compass 4xe',
      'Gladiator (Pickup)',
      'Grand Cherokee / 4xe',
      'Patriot',
      'Renegade / Renegade 4xe',
      'Wrangler (Sahara / Rubicon)'
    ]
  },
  {
    brand: 'Honda',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Civic', 'Civic Type R', 'CR-V', 'HR-V', 'ZR-V', 'Jazz'],
    models: [
      'Accord / Accord Tourer',
      'Civic (5-Türer / Limousine)',
      'Civic Type R',
      'CR-V (e:HEV / e:PHEV)',
      'CR-Z',
      'e:Ny1 (Elektro-SUV)',
      'Honda e',
      'HR-V',
      'Insight',
      'Jazz / Jazz Crosstar',
      'ZR-V'
    ]
  },
  {
    brand: 'Mitsubishi',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'L200', 'Colt'],
    models: [
      'ASX',
      'Colt',
      'Eclipse Cross Plug-in Hybrid',
      'L200 (Pickup)',
      'Lancer / Lancer Evolution',
      'Outlander / Outlander PHEV',
      'Pajero',
      'Space Star'
    ]
  },
  {
    brand: 'Subaru',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Forester', 'Outback', 'Crosstrek', 'XV', 'Solterra', 'BRZ'],
    models: [
      'BRZ',
      'Crosstrek',
      'Forester (e-BOXER)',
      'Impreza',
      'Levorg',
      'Outback',
      'Solterra (Elektro)',
      'WRX STI',
      'XV'
    ]
  },
  {
    brand: 'Lexus',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Premium',
    popularModels: ['LBX', 'NX', 'RX', 'UX', 'ES', 'RZ'],
    models: [
      'CT 200h',
      'ES 300h',
      'GX',
      'IS 300h',
      'LBX',
      'LC 500 / 500h',
      'LM (Luxus-Van)',
      'LS 500h',
      'LX',
      'NX 350h / NX 450h+',
      'RC / RC F',
      'RX 350h / RX 450h+ / RX 500h',
      'RZ 450e',
      'UX 250h / UX 300e'
    ]
  },
  {
    brand: 'Polestar',
    country: 'Schweden / China',
    flag: '🇸🇪',
    category: 'Elektro',
    popularModels: ['Polestar 2', 'Polestar 3', 'Polestar 4'],
    models: [
      'Polestar 1',
      'Polestar 2 (Standard / Long Range / BST)',
      'Polestar 3 (Performance)',
      'Polestar 4',
      'Polestar 5'
    ]
  },
  {
    brand: 'BYD',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['Atto 3', 'Seal', 'Dolphin', 'Seal U', 'Tang', 'Han'],
    models: [
      'Atto 3',
      'Dolphin',
      'Dolphin Mini',
      'Han',
      'Seal (Design / Excellence AWD)',
      'Seal U / Seal U DM-i (Plug-in)',
      'Sealion 7',
      'Tang'
    ]
  },
  {
    brand: 'MG',
    country: 'Großbritannien / China',
    flag: '🇬🇧',
    category: 'Volumen',
    popularModels: ['MG4 Electric', 'MG5 Electric', 'ZS EV', 'HS', 'Cyberster', 'MG3'],
    models: [
      'Cyberster (Roadster)',
      'Marvel R Electric',
      'MG3 Hybrid+',
      'MG4 Electric (Standard / Comfort / Luxury / XPOWER)',
      'MG5 Electric (Kombi)',
      'MG HS / EHS Plug-in Hybrid',
      'MG ZS / ZS EV'
    ]
  },
  {
    brand: 'Genesis',
    country: 'Südkorea',
    flag: '🇰🇷',
    category: 'Premium',
    popularModels: ['GV70', 'GV80', 'G70 Shooting Brake', 'G80', 'GV60'],
    models: [
      'Electrified G80',
      'Electrified GV70',
      'G70 Limousine',
      'G70 Shooting Brake',
      'G80 Limousine',
      'G90',
      'GV60 (Elektro)',
      'GV70 SUV',
      'GV80 SUV',
      'GV80 Coupé'
    ]
  },
  {
    brand: 'MAN',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Nutzfahrzeuge',
    popularModels: ['TGE Kastenwagen', 'TGE Kombi', 'TGE Pritsche', 'eTGE'],
    models: [
      'eTGE (Elektro-Transporter)',
      'TGE Fahrgestell',
      'TGE Kastenwagen (Standard / Hochdach / Superhochdach)',
      'TGE Kombi',
      'TGE Pritsche / Doppelkabine'
    ]
  },
  {
    brand: 'Iveco',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Nutzfahrzeuge',
    popularModels: ['Daily Kastenwagen', 'Daily Pritsche', 'eDaily'],
    models: [
      'Daily Doppelkabine',
      'Daily Fahrgestell',
      'Daily Kastenwagen (35S / 50C / 70C)',
      'Daily Pritsche',
      'eDaily (Elektro)'
    ]
  },
  {
    brand: 'DS Automobiles',
    country: 'Frankreich',
    flag: '🇫🇷',
    category: 'Premium',
    popularModels: ['DS 7', 'DS 4', 'DS 3', 'DS 9'],
    models: [
      'DS 3 / DS 3 Crossback (E-TENSE)',
      'DS 4 (Cross / Rivoli / E-TENSE)',
      'DS 7 / DS 7 Crossback (E-TENSE 4x4)',
      'DS 9 Limousine'
    ]
  },
  {
    brand: 'Aston Martin',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Luxus',
    popularModels: ['DBX', 'Vantage', 'DB12', 'DBS', 'Vanquish'],
    models: [
      'DB11 Coupé / Volante',
      'DB12 Coupé / Volante',
      'DBS Superleggera / Volante',
      'DBX / DBX707 (SUV)',
      'Rapide',
      'Vanquish',
      'Vantage V8 / V12 Coupé / Roadster'
    ]
  },
  {
    brand: 'Bentley',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Luxus',
    popularModels: ['Continental GT', 'Bentayga', 'Flying Spur'],
    models: [
      'Bentayga (V8 / Hybrid / EWB)',
      'Continental GT Coupé',
      'Continental GTC Cabriolet',
      'Flying Spur (V8 / W12 / Hybrid)',
      'Mulsanne'
    ]
  },
  {
    brand: 'Ferrari',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Sportwagen',
    popularModels: ['296 GTB', 'Purosangue', 'Roma', 'SF90 Stradale', '812 Superfast'],
    models: [
      '12Cilindri',
      '296 GTB / 296 GTS',
      '488 GTB / Spider / Pista',
      '812 Superfast / GTS / Competizione',
      'F8 Tributo / Spider',
      'Portofino / Portofino M',
      'Purosangue (SUV)',
      'Roma / Roma Spider',
      'SF90 Stradale / Spider'
    ]
  },
  {
    brand: 'Lamborghini',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Sportwagen',
    popularModels: ['Urus', 'Huracán', 'Revuelto', 'Temerario'],
    models: [
      'Aventador (S / SVJ / Ultimae)',
      'Gallardo',
      'Huracán (Evo / STO / Tecnica / Sterrato)',
      'Murciélago',
      'Revuelto (V12 Hybrid)',
      'Temerario',
      'Urus / Urus S / Urus Performante / Urus SE'
    ]
  },
  {
    brand: 'Maserati',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Luxus',
    popularModels: ['Grecale', 'Ghibli', 'Levante', 'GranTurismo', 'MC20'],
    models: [
      'Ghibli',
      'GranCabrio',
      'GranTurismo (Modena / Trofeo / Folgore)',
      'Grecale (GT / Modena / Trofeo / Folgore)',
      'Levante',
      'MC20 Coupé / Cielo (Spider)',
      'Quattroporte'
    ]
  },
  {
    brand: 'Rolls-Royce',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Luxus',
    popularModels: ['Cullinan', 'Ghost', 'Spectre', 'Phantom'],
    models: [
      'Cullinan / Black Badge',
      'Dawn',
      'Ghost / Black Badge',
      'Phantom / Extended',
      'Spectre (Elektro)',
      'Wraith'
    ]
  },
  {
    brand: 'McLaren',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Sportwagen',
    popularModels: ['750S', 'Artura', '720S', 'GT / GTS'],
    models: [
      '570S / 570GT / 600LT',
      '720S / 765LT',
      '750S Coupé / Spider',
      'Artura / Artura Spider',
      'GT',
      'GTS',
      'Senna'
    ]
  },
  {
    brand: 'Alpine',
    country: 'Frankreich',
    flag: '🇫🇷',
    category: 'Sportwagen',
    popularModels: ['A110', 'A110 S', 'A110 GT', 'A290'],
    models: [
      'A110 Pure / Légende',
      'A110 GT',
      'A110 S',
      'A110 R',
      'A290 (Elektro)'
    ]
  },
  {
    brand: 'Chevrolet',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Sportwagen',
    popularModels: ['Corvette C8 Stingray', 'Camaro', 'Tahoe', 'Silverado'],
    models: [
      'Blazer',
      'Camaro Coupé / Convertible',
      'Captiva',
      'Corvette C7 (Stingray / Z06 / Grand Sport)',
      'Corvette C8 (Stingray / Z06 / E-Ray)',
      'Silverado 1500',
      'Suburban',
      'Tahoe',
      'Trax'
    ]
  },
  {
    brand: 'Dodge',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Sportwagen',
    popularModels: ['Challenger', 'Charger', 'Durango', 'RAM 1500'],
    models: [
      'Challenger (SXT / R/T / Scat Pack / Hellcat)',
      'Charger (SXT / R/T / Hellcat)',
      'Durango (R/T / SRT / Hellcat)',
      'RAM 1500 (V8 HEMI)'
    ]
  },
  {
    brand: 'RAM',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Nutzfahrzeuge',
    popularModels: ['RAM 1500 Laramie', 'RAM 1500 Limited', 'RAM 1500 TRX'],
    models: [
      '1500 Big Horn',
      '1500 Classic',
      '1500 Laramie',
      '1500 Limited',
      '1500 Rebel',
      '1500 TRX (6.2L Supercharged)',
      '2500 Heavy Duty',
      '3500 Heavy Duty'
    ]
  },
  {
    brand: 'Cadillac',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Luxus',
    popularModels: ['Escalade', 'Lyriq', 'XT4', 'XT5', 'CT5'],
    models: [
      'CT4 / CT4-V Blackwing',
      'CT5 / CT5-V Blackwing',
      'Escalade / Escalade-V',
      'Lyriq (Elektro-SUV)',
      'XT4',
      'XT5',
      'XT6'
    ]
  },
  {
    brand: 'Chrysler',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Volumen',
    popularModels: ['Pacifica', '300C', 'Grand Voyager'],
    models: [
      '300C (Limousine / Touring)',
      'Grand Voyager',
      'Pacifica (V6 / Hybrid Minivan)',
      'Voyager'
    ]
  },
  {
    brand: 'SsangYong / KGM',
    country: 'Südkorea',
    flag: '🇰🇷',
    category: 'Volumen',
    popularModels: ['Torres', 'Korando', 'Rexton', 'Musso', 'Tivoli'],
    models: [
      'Korando / Korando e-Motion',
      'Musso / Musso Grand (Pickup)',
      'Rexton',
      'Tivoli',
      'Tivoli Grand',
      'Torres',
      'Torres EVX (Elektro)'
    ]
  },
  {
    brand: 'Lynk & Co',
    country: 'Schweden / China',
    flag: '🇸🇪',
    category: 'Elektro',
    popularModels: ['01', '02', '08'],
    models: [
      '01 (Plug-in Hybrid)',
      '02',
      '08'
    ]
  },
  {
    brand: 'NIO',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['ET5 Touring', 'EL6', 'ET7', 'EL7', 'EL8'],
    models: [
      'EL6 (SUV)',
      'EL7 (SUV)',
      'EL8 (Luxus-SUV)',
      'ET5 Limousine',
      'ET5 Touring (Kombi)',
      'ET7 (Oberklasse-Limousine)'
    ]
  },
  {
    brand: 'Voyah',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['Free', 'Dream', 'Passion'],
    models: [
      'Dream (Luxus-Van)',
      'Free (Elektro-SUV)',
      'Passion (Limousine)'
    ]
  },
  {
    brand: 'Lucid',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Luxus',
    popularModels: ['Air Pure', 'Air Touring', 'Air Grand Touring', 'Air Sapphire', 'Gravity'],
    models: [
      'Air Dream Edition',
      'Air Grand Touring',
      'Air Pure',
      'Air Sapphire (1.200+ PS)',
      'Air Touring',
      'Gravity (SUV)'
    ]
  },
  {
    brand: 'GWM (Great Wall Motor)',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['Ora 03', 'Ora 07', 'Wey 03', 'Wey 05'],
    models: [
      'Ora 03 (Funky Cat)',
      'Ora 07 (Lightning Cat)',
      'Wey 03 (Coffee 02 Plug-in)',
      'Wey 05 (Coffee 01 Plug-in)'
    ]
  },
  {
    brand: 'Maxus',
    country: 'China',
    flag: '🇨🇳',
    category: 'Nutzfahrzeuge',
    popularModels: ['eDeliver 3', 'eDeliver 9', 'Deliver 9', 'T90 EV', 'MIFA 9'],
    models: [
      'Deliver 9 (Diesel-Transporter)',
      'eDeliver 3 (Kompakt-Transporter)',
      'eDeliver 7',
      'eDeliver 9 (Großraum-Transporter)',
      'MIFA 7 (Elektro-Van)',
      'MIFA 9 (Luxus Elektro-Van)',
      'T90 EV (Elektro-Pickup)'
    ]
  },
  {
    brand: 'Lotus',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Sportwagen',
    popularModels: ['Emira', 'Eletre', 'Emeya'],
    models: [
      'Elise',
      'Eletre / Eletre R (Hyper-SUV)',
      'Emeya (Hyper-GT)',
      'Emira (V6 / i4 Turbo)',
      'Evija (Hypercar)',
      'Exige'
    ]
  },
  {
    brand: 'Lada',
    country: 'Russland',
    flag: '🇷🇺',
    category: 'Volumen',
    popularModels: ['Niva / 4x4', 'Taiga', 'Granta', 'Vesta'],
    models: [
      'Granta',
      'Kalina',
      'Niva 4x4 / Legend',
      'Niva Travel',
      'Taiga',
      'Vesta / Vesta SW'
    ]
  },
  {
    brand: 'Abarth',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Sportwagen',
    popularModels: ['595', '695', '500e', '600e'],
    models: [
      '124 Spider',
      '500',
      '500e',
      '595 (Turismo / Competizione / Esseesse)',
      '600e',
      '695 (Biposto / Tributo Ferrari / Esseesse)'
    ]
  },
  {
    brand: 'Alpina',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Luxus',
    popularModels: ['B3 Touring', 'B5 Touring', 'D3 S', 'XB7'],
    models: [
      'B3 Limousine / Touring',
      'B4 Gran Coupé',
      'B5 Limousine / Touring',
      'B7',
      'B8 Gran Coupé',
      'D3 S Limousine / Touring',
      'D4 S Gran Coupé',
      'D5 S Limousine / Touring',
      'XB7',
      'XD3',
      'XD4'
    ]
  },
  {
    brand: 'Infiniti',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Premium',
    popularModels: ['Q30', 'Q50', 'QX70', 'QX30'],
    models: [
      'FX37 / FX50',
      'Q30',
      'Q50',
      'Q60 Coupé',
      'Q70',
      'QX30',
      'QX50',
      'QX70'
    ]
  },
  {
    brand: 'Daihatsu',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Volumen',
    popularModels: ['Copen', 'Sirion', 'Terios', 'Cuore'],
    models: [
      'Copen',
      'Cuore',
      'Materia',
      'Sirion',
      'Terios (4x4)',
      'Trevis'
    ]
  },
  {
    brand: 'Saab',
    country: 'Schweden',
    flag: '🇸🇪',
    category: 'Premium',
    popularModels: ['9-3 SportCombi', '9-5 SportCombi', '9-3 Cabriolet'],
    models: [
      '9-3 Limousine',
      '9-3 SportCombi',
      '9-3 Cabriolet',
      '9-3X',
      '9-5 Limousine',
      '9-5 SportCombi'
    ]
  },
  {
    brand: 'Lancia',
    country: 'Italien',
    flag: '🇮🇹',
    category: 'Volumen',
    popularModels: ['Ypsilon', 'Delta', 'Thema', 'Voyager'],
    models: [
      'Delta',
      'Flavia Cabriolet',
      'Musa',
      'Thema',
      'Voyager',
      'Ypsilon'
    ]
  },
  {
    brand: 'Isuzu',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Nutzfahrzeuge',
    popularModels: ['D-Max Space Cab', 'D-Max Double Cab'],
    models: [
      'D-Max Single Cab',
      'D-Max Space Cab',
      'D-Max Double Cab',
      'D-Max V-Cross',
      'Trooper'
    ]
  },
  {
    brand: 'Aiways',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['U5', 'U6'],
    models: [
      'U5 (Elektro-SUV)',
      'U6 (SUV-Coupé)'
    ]
  },
  {
    brand: 'Fisker',
    country: 'USA',
    flag: '🇺🇸',
    category: 'Elektro',
    popularModels: ['Ocean One', 'Ocean Extreme', 'Ocean Ultra'],
    models: [
      'Karma',
      'Ocean Extreme',
      'Ocean One',
      'Ocean Sport',
      'Ocean Ultra'
    ]
  },
  {
    brand: 'Xpeng',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['G9', 'G6', 'P7'],
    models: [
      'G6 (SUV-Coupé)',
      'G9 (Premium-SUV)',
      'P7 (Sport-Limousine)'
    ]
  },
  {
    brand: 'Zeekr',
    country: 'China',
    flag: '🇨🇳',
    category: 'Elektro',
    popularModels: ['001', 'X', '009'],
    models: [
      '001 (Shooting Brake / FR)',
      '009 (Luxus-Van)',
      'X (Kompakt-SUV)'
    ]
  },
  {
    brand: 'Omoda',
    country: 'China',
    flag: '🇨🇳',
    category: 'Volumen',
    popularModels: ['Omoda 5', 'Omoda 5 EV'],
    models: [
      'Omoda 5 (Benziner)',
      'Omoda 5 EV (Elektro)'
    ]
  },
  {
    brand: 'Jaecoo',
    country: 'China',
    flag: '🇨🇳',
    category: 'Volumen',
    popularModels: ['Jaecoo 7', 'Jaecoo 8'],
    models: [
      'Jaecoo 7 (SUV / AWD)',
      'Jaecoo 8'
    ]
  },
  {
    brand: 'KTM',
    country: 'Österreich',
    flag: '🇦🇹',
    category: 'Sportwagen',
    popularModels: ['X-Bow GT', 'X-Bow GT-XR'],
    models: [
      'X-Bow',
      'X-Bow GT',
      'X-Bow GT4',
      'X-Bow GT-XR',
      'X-Bow R'
    ]
  },
  {
    brand: 'Morgan',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Sportwagen',
    popularModels: ['Plus Four', 'Plus Six', 'Super 3'],
    models: [
      '3 Wheeler',
      'Plus 4',
      'Plus 8',
      'Plus Four',
      'Plus Six',
      'Super 3'
    ]
  },
  {
    brand: 'Wiesmann',
    country: 'Deutschland',
    flag: '🇩🇪',
    category: 'Sportwagen',
    popularModels: ['Roadster MF3', 'GT MF4', 'Project Thunderball'],
    models: [
      'GT MF4 / MF4-S',
      'GT MF5',
      'Project Thunderball (Elektro-Roadster)',
      'Roadster MF3',
      'Roadster MF4',
      'Roadster MF5'
    ]
  },
  {
    brand: 'Caterham',
    country: 'Großbritannien',
    flag: '🇬🇧',
    category: 'Sportwagen',
    popularModels: ['Seven 170', 'Seven 360', 'Seven 420'],
    models: [
      'Seven 170',
      'Seven 360',
      'Seven 420',
      'Seven 620',
      'Super Seven'
    ]
  }
];

/**
 * All known brand names as a flat sorted list
 */
export const ALL_BRAND_NAMES: string[] = VEHICLE_DATASET.map(b => b.brand).sort((a, b) => a.localeCompare(b));

/**
 * Brand metadata list for UI Combobox options (No flags)
 */
export const BRAND_METADATA_LIST = VEHICLE_DATASET.map(b => ({
  brand: b.brand,
  country: b.country,
  category: b.category,
  popularModels: b.popularModels
}));

/**
 * Returns brand metadata if known in the dataset
 */
export function getBrandMetadata(brandName: string): VehicleBrandEntry | undefined {
  if (!brandName) return undefined;
  const normalized = brandName.trim().toLowerCase();
  return VEHICLE_DATASET.find(b => b.brand.toLowerCase() === normalized);
}

/**
 * Dynamic Cascading Model Filter:
 * Returns the comprehensive list of all models for a selected brand directly from KBA + catalog.
 */
export function getModelsForBrand(brandName: string): string[] {
  if (!brandName || !brandName.trim()) {
    return [];
  }
  
  const kbaModels = getKbaModelsForBrand(brandName);
  const entry = getBrandMetadata(brandName);
  const catalogModels = entry ? entry.models : [];

  // Deduplicate and combine catalog models with KBA models
  const combinedSet = new Set<string>();
  const seenLower = new Set<string>();

  // Add popular / catalog models first
  for (const m of catalogModels) {
    const low = m.trim().toLowerCase();
    if (low && !seenLower.has(low)) {
      seenLower.add(low);
      combinedSet.add(m.trim());
    }
  }

  // Add all KBA official model designations
  for (const m of kbaModels) {
    const low = m.trim().toLowerCase();
    if (low && !seenLower.has(low)) {
      seenLower.add(low);
      combinedSet.add(m.trim());
    }
  }

  // Sort all models alphabetically (A-Z)
  return Array.from(combinedSet).sort((a, b) => 
    a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' })
  );
}

/**
 * Search brands with query string
 */
export function searchBrands(query: string): VehicleBrandEntry[] {
  if (!query || !query.trim()) {
    return VEHICLE_DATASET;
  }
  const q = query.trim().toLowerCase();
  return VEHICLE_DATASET.filter(b => 
    b.brand.toLowerCase().includes(q) || 
    b.country.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  );
}

/**
 * Search models for a specific brand with query
 */
export function searchModels(brandName: string, query: string): string[] {
  const models = getModelsForBrand(brandName);
  if (!query || !query.trim()) {
    return models;
  }
  const q = query.trim().toLowerCase();
  return models.filter(m => m.toLowerCase().includes(q));
}
