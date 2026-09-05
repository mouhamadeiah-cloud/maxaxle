import { ComboboxOption } from '../components/VehicleCombobox';

/**
 * Standard German automotive option lists for Dropdown-First architecture.
 * Every list is provided as ComboboxOption items or string arrays for flexible Combobox usage.
 */

export const BODY_TYPE_OPTIONS: ComboboxOption[] = [
  { value: 'Limousine', label: 'Limousine', badge: 'Stufenheck' },
  { value: 'Kombi', label: 'Kombi (Touring / Avant / T-Modell)', badge: 'Familie' },
  { value: 'SUV / Geländewagen', label: 'SUV / Geländewagen', badge: 'Bestseller' },
  { value: 'Coupé', label: 'Coupé', badge: 'Sport' },
  { value: 'Cabriolet / Roadster', label: 'Cabriolet / Roadster', badge: 'Sommer' },
  { value: 'Kompaktklasse', label: 'Kompaktklasse / Schrägheck' },
  { value: 'Sportwagen', label: 'Sportwagen / Supersportler', badge: 'Performance' },
  { value: 'Van / Kleinbus', label: 'Van / Minivan / Kleinbus' },
  { value: 'Transporter / Kastenwagen', label: 'Transporter / Kastenwagen', badge: 'Nutzfahrzeug' },
  { value: 'Pick-up', label: 'Pick-up' }
];

export const FUEL_TYPE_OPTIONS: ComboboxOption[] = [
  { value: 'Benzin', label: 'Benzin', badge: 'Otto' },
  { value: 'Diesel', label: 'Diesel', badge: 'TDI/d/CDI' },
  { value: 'Elektro', label: 'Elektro (BEV)', badge: 'E-Kennzeichen' },
  { value: 'Hybrid', label: 'Hybrid (Benzin/Elektro)' },
  { value: 'Plug-in-Hybrid', label: 'Plug-in-Hybrid (PHEV)', badge: 'E-Kennzeichen' },
  { value: 'Erdgas (CNG)', label: 'Erdgas (CNG)' },
  { value: 'Autogas (LPG)', label: 'Autogas (LPG)' },
  { value: 'Wasserstoff', label: 'Wasserstoff (Brennstoffzelle)' }
];

export const TRANSMISSION_OPTIONS: ComboboxOption[] = [
  { value: 'Automatik', label: 'Automatik (Wandler / Steptronic / 9G-TRONIC)', badge: 'Standard' },
  { value: 'Doppelkupplung', label: 'Doppelkupplung (DSG / S tronic / DKG / PDK)', badge: 'Sport' },
  { value: 'Schaltgetriebe', label: 'Schaltgetriebe (Manuell)' },
  { value: 'Stufenlos (CVT)', label: 'Stufenloses Getriebe (CVT)' },
  { value: 'Halbautomatik', label: 'Halbautomatik / Sequenziell' }
];

export const COLOR_OPTIONS: ComboboxOption[] = [
  { value: 'Schwarz Metallic', label: 'Schwarz Metallic', badge: '✨ Metallic', subtext: 'Beliebteste Außenfarbe' },
  { value: 'Schwarz Uni', label: 'Schwarz Uni', badge: 'Uni Lack' },
  { value: 'Weiß Uni', label: 'Weiß Uni', badge: 'Uni Lack' },
  { value: 'Mineralweiß / Perlweiß Metallic', label: 'Mineralweiß / Perlweiß Metallic', badge: '✨ Metallic', subtext: 'Perleffekt-Mehrschichtlack' },
  { value: 'Grau Metallic / Anthrazit', label: 'Grau Metallic / Anthrazit', badge: '✨ Metallic' },
  { value: 'Dravitgrau / Nardograu Metallic', label: 'Dravitgrau / Nardograu Metallic', badge: '✨ Metallic', subtext: 'Trendfarbe Individual' },
  { value: 'Silber Metallic', label: 'Silber Metallic', badge: '✨ Metallic', subtext: 'Klassische Metallic-Lackierung' },
  { value: 'Blau Metallic', label: 'Blau Metallic', badge: '✨ Metallic' },
  { value: 'Tansanitblau / Nachtblau Metallic', label: 'Tansanitblau / Nachtblau Metallic', badge: '✨ Metallic', subtext: 'Tiefblau mit Metallic-Effekt' },
  { value: 'Rot Metallic', label: 'Rot Metallic', badge: '✨ Metallic' },
  { value: 'Grün / Isle of Man Grün Metallic', label: 'Grün / Isle of Man Grün Metallic', badge: '✨ Metallic' },
  { value: 'Gelb Uni', label: 'Gelb Uni', badge: 'Uni Lack' },
  { value: 'Braun / Champagner Metallic', label: 'Braun / Champagner Metallic', badge: '✨ Metallic' },
  { value: 'Frozen / Mattgrau', label: 'Frozen / Mattgrau', badge: 'Sonderlack / Matt' },
  { value: 'Mattschwarz', label: 'Mattschwarz', badge: 'Sonderlack / Matt' },
  { value: 'Folierung / Sonderlackierung', label: 'Folierung / Sonderlackierung', badge: 'Individuell' }
];

export const VARIANT_OPTIONS: ComboboxOption[] = [
  { value: 'M Sport Paket', label: 'M Sport Paket', badge: 'BMW' },
  { value: 'M Sport Pro', label: 'M Sport Pro (Shadowline)', badge: 'BMW' },
  { value: 'AMG Line', label: 'AMG Line (Exterieur + Interieur)', badge: 'Mercedes' },
  { value: 'AMG Night-Paket', label: 'AMG Night-Paket', badge: 'Mercedes' },
  { value: 'S line', label: 'S line Sportpaket + Black Optik', badge: 'Audi' },
  { value: 'R-Line', label: 'R-Line Black Style', badge: 'VW' },
  { value: 'Executive Edition', label: 'Executive Edition / Business' },
  { value: 'Innovation Paket + Laserlicht', label: 'Innovation Paket + Laserlicht / Head-Up' },
  { value: 'Panoramadach + Vollleder', label: 'Panoramadach + Vollleder + Sound' },
  { value: 'Standheizung + ACC + AHK', label: 'Standheizung + ACC + AHK (Anhängerkupplung)' },
  { value: 'Luftfederung + 360° Kamera', label: 'Luftfederung + 360° Kamera (Surround View)' },
  { value: 'Highline / Elegance', label: 'Highline / Elegance' },
  { value: 'Basis / Serienausstattung', label: 'Basis / Serienausstattung' }
];

export const LOCATION_OPTIONS: ComboboxOption[] = [
  { value: 'Hauptstandort Berlin-Mitte', label: 'Hauptstandort Berlin-Mitte', badge: 'Zentrale' },
  { value: 'Filiale Berlin-Spandau', label: 'Filiale Berlin-Spandau' },
  { value: 'Showroom Charlottenburg', label: 'Showroom Charlottenburg', badge: 'Premium' },
  { value: 'Außenlager Süd (Logistikzentrum)', label: 'Außenlager Süd (Logistikzentrum)', badge: 'Lager' },
  { value: 'Filiale München-Schwabing', label: 'Filiale München-Schwabing' },
  { value: 'Filiale Hamburg-Altona', label: 'Filiale Hamburg-Altona' },
  { value: 'Filiale Frankfurt-Westend', label: 'Filiale Frankfurt-Westend' }
];

export const DRIVE_TYPE_OPTIONS: ComboboxOption[] = [
  { value: 'Allradantrieb (AWD / 4MATIC / xDrive / quattro)', label: 'Allradantrieb (AWD / 4MATIC / xDrive / quattro)', badge: '4x4' },
  { value: 'Hinterradantrieb (RWD / Heckantrieb)', label: 'Hinterradantrieb (RWD / Heckantrieb)' },
  { value: 'Vorderradantrieb (FWD / Frontantrieb)', label: 'Vorderradantrieb (FWD / Frontantrieb)' }
];

export const DOORS_OPTIONS: ComboboxOption[] = [
  { value: '4/5 Türen', label: '4/5 Türen', badge: 'Standard' },
  { value: '2/3 Türen', label: '2/3 Türen' },
  { value: '6/7 Türen', label: '6/7 Türen (Transporter / Bus)' }
];

export const SEATS_OPTIONS: ComboboxOption[] = [
  { value: '5 Sitze', label: '5 Sitze', badge: 'Standard' },
  { value: '4 Sitze', label: '4 Sitze (Einzelsitze hinten)' },
  { value: '2 Sitze', label: '2 Sitze (Roadster / Coupe)' },
  { value: '7 Sitze', label: '7 Sitze (3. Sitzreihe)', badge: 'Familie' },
  { value: '8 Sitze', label: '8 Sitze (Van / Bus)' },
  { value: '9 Sitze', label: '9 Sitze (Personentransport)' }
];

export const EMISSION_OPTIONS: ComboboxOption[] = [
  { value: 'Euro 6d', label: 'Euro 6d (Grüne Plakette)', badge: 'Modern' },
  { value: 'Euro 6d-TEMP', label: 'Euro 6d-TEMP (Grüne Plakette)' },
  { value: 'Euro 6', label: 'Euro 6 (Grüne Plakette)' },
  { value: 'Euro 5', label: 'Euro 5 (Grüne Plakette)' },
  { value: 'Euro 4', label: 'Euro 4 (Grüne Plakette)' },
  { value: 'Elektro (0 g/km)', label: 'Elektro (0 g CO2 / E-Kennzeichen)', badge: 'Emissionsfrei' }
];

export const OWNERS_OPTIONS: ComboboxOption[] = [
  { value: '0 (Neufahrzeug / Tageszulassung)', label: '0 (Neufahrzeug / Tageszulassung)', badge: '0 Vorbesitzer', subtext: 'Neuwagen ohne Voreintrag' },
  { value: '1 (1. Hand)', label: '1 (1. Hand / 1 Vorbesitzer)', badge: '1. Hand', subtext: 'Erstbesitz / Top Zustand' },
  { value: '2 (2. Hand)', label: '2 (2. Hand / 2 Vorbesitzer)', badge: '2. Hand', subtext: 'Zweitbesitz' },
  { value: '3 (3. Hand)', label: '3 (3. Hand / 3 Vorbesitzer)', badge: '3. Hand' },
  { value: '4 (4. Hand)', label: '4 (4. Hand / 4 Vorbesitzer)', badge: '4. Hand' },
  { value: '5 (5. Hand)', label: '5 (5. Hand / 5 Vorbesitzer)', badge: '5. Hand' },
  { value: '6+ (6 oder mehr)', label: '6+ (6 oder mehr Vorbesitzer)', badge: '6+' },
  { value: 'Unbekannt', label: 'Unbekannt (Fahrzeughalter unbekannt)', badge: 'Unbekannt', subtext: 'Keine gesicherte Vorbesitzer-Anzahl' }
];

export const SELLER_TYPE_OPTIONS: ComboboxOption[] = [
  { value: 'Inzahlungnahme (Privatkunde)', label: 'Inzahlungnahme (Privatkunde)', badge: 'B2C' },
  { value: 'Händlereinkauf (B2B)', label: 'Händlereinkauf (B2B)', badge: 'B2B' },
  { value: 'Leasingrückläufer (Flotte)', label: 'Leasingrückläufer (Flotte / Firmenwagen)' },
  { value: 'Auktion / Großhandel (BCA / Autobid)', label: 'Auktion / Großhandel (BCA / Autobid)' },
  { value: 'Import / EU-Fahrzeug', label: 'Import / EU-Fahrzeug' },
  { value: 'Kommissionsverkauf', label: 'Kommissionsverkauf (Im Kundenauftrag)' }
];

// Condition Mechanical Combobox Options
export const ENGINE_CONDITION_OPTIONS: ComboboxOption[] = [
  { value: 'Einwandfrei & trocken (Kein Ölverlust)', label: 'Einwandfrei & trocken (Kein Ölverlust)', badge: 'Note 1' },
  { value: 'Sehr guter Lauf, ruhiger Kaltstart', label: 'Sehr guter Lauf, ruhiger Kaltstart', badge: 'Note 1-2' },
  { value: 'Guter Gesamtzustand, normale Laufgeräusche', label: 'Guter Gesamtzustand, normale Laufgeräusche' },
  { value: 'Leichte Ölfeuchte an Ventildeckel (unbedenklich)', label: 'Leichte Ölfeuchte an Ventildeckel (unbedenklich)' },
  { value: 'Inspektion / Ölwechsel fällig', label: 'Inspektion / Ölwechsel fällig', badge: 'Wartung' },
  { value: 'Zahnriemen / Steuerkette fällig', label: 'Zahnriemen / Steuerkette fällig', badge: 'Reparatur' }
];

export const TRANSMISSION_CONDITION_OPTIONS: ComboboxOption[] = [
  { value: 'Schaltet butterweich & präzise', label: 'Schaltet butterweich & präzise', badge: 'Note 1' },
  { value: 'Einwandfreie Schaltvorgänge ohne Ruckeln', label: 'Einwandfreie Schaltvorgänge ohne Ruckeln' },
  { value: 'Kupplung greift straff & sauber', label: 'Kupplung greift straff & sauber' },
  { value: 'Getriebespülung / Ölwechsel empfohlen', label: 'Getriebespülung / Ölwechsel empfohlen', badge: 'Wartung' },
  { value: 'Leichtes Synchronring-Kratzen im 2. Gang', label: 'Leichtes Synchronring-Kratzen im 2. Gang' }
];

export const BRAKES_TIRES_OPTIONS: ComboboxOption[] = [
  { value: 'Sehr gut (VA >6mm / HA >6mm, Bremsen neuwertig)', label: 'Sehr gut (VA >6mm / HA >6mm, Bremsen neuwertig)', badge: 'Note 1' },
  { value: 'Gut (VA 5mm / HA 5mm, Bremsen ca. 70%)', label: 'Gut (VA 5mm / HA 5mm, Bremsen ca. 70%)' },
  { value: 'Befriedigend (VA 4mm / HA 4mm, noch 1 Saison)', label: 'Befriedigend (VA 4mm / HA 4mm, noch 1 Saison)' },
  { value: 'Reifen neuwertig + Bremsen vorne neu belegt', label: 'Reifen neuwertig + Bremsen vorne neu belegt', badge: 'Neu' },
  { value: 'Reifenwechsel vor Auslieferung erforderlich', label: 'Reifenwechsel vor Auslieferung erforderlich', badge: 'Aktion' },
  { value: '8-fach bereift (Sommer- & Winterräder Alufelgen)', label: '8-fach bereift (Sommer- & Winterräder Alufelgen)' }
];

// Condition Visual Combobox Options
export const PAINT_CONDITION_OPTIONS: ComboboxOption[] = [
  { value: 'Sehr gepflegt, aufbereitet & versiegelt', label: 'Sehr gepflegt, aufbereitet & versiegelt', badge: 'Note 1' },
  { value: 'Neuwertiger Werkslack ohne Mängel', label: 'Neuwertiger Werkslack ohne Mängel', badge: 'Note 1' },
  { value: 'Gepflegter Gebrauchtzustand mit minimalen Steinschlägen', label: 'Gepflegter Gebrauchtzustand mit minimalen Steinschlägen' },
  { value: 'Leichte Waschanlagenkratzer (Politur möglich)', label: 'Leichte Waschanlagenkratzer (Politur möglich)' },
  { value: 'Aufbereitung & Detailpolitur erforderlich', label: 'Aufbereitung & Detailpolitur erforderlich', badge: 'Aufbereitung' }
];

export const INTERIOR_CONDITION_OPTIONS: ComboboxOption[] = [
  { value: 'Neuwertig & rauchfrei (Nichtraucherfahrzeug)', label: 'Neuwertig & rauchfrei (Nichtraucherfahrzeug)', badge: 'Note 1' },
  { value: 'Sehr gepflegtes Leder, gereinigt & imprägniert', label: 'Sehr gepflegtes Leder, gereinigt & imprägniert' },
  { value: 'Gepflegter Zustand, keine Risse oder Flecken', label: 'Gepflegter Zustand, keine Risse oder Flecken' },
  { value: 'Geringe Gebrauchsspuren an Einstiegswange', label: 'Geringe Gebrauchsspuren an Einstiegswange' },
  { value: 'Professionelle Innenraumaufbereitung eingeplant', label: 'Professionelle Innenraumaufbereitung eingeplant', badge: 'Aufbereitung' }
];

// Damage / Zustandsbericht Parts, Types & Severity Combobox Options
export const DAMAGE_PARTS_OPTIONS: ComboboxOption[] = [
  { value: 'Stoßstange vorne', label: 'Stoßstange vorne', category: 'Front' },
  { value: 'Kühlergrill / Frontspoiler', label: 'Kühlergrill / Frontspoiler', category: 'Front' },
  { value: 'Motorhaube', label: 'Motorhaube', category: 'Front' },
  { value: 'Scheinwerfer links', label: 'Scheinwerfer links', category: 'Front' },
  { value: 'Scheinwerfer rechts', label: 'Scheinwerfer rechts', category: 'Front' },
  { value: 'Windschutzscheibe', label: 'Windschutzscheibe (Frontscheibe)', category: 'Glas' },
  { value: 'Dach', label: 'Dach / Panoramadach', category: 'Karosserie' },
  { value: 'Kotflügel vorne links', label: 'Kotflügel vorne links', category: 'Links' },
  { value: 'Tür vorne links', label: 'Tür vorne links (Fahrertür)', category: 'Links' },
  { value: 'Tür hinten links', label: 'Tür hinten links', category: 'Links' },
  { value: 'Kotflügel hinten links', label: 'Kotflügel hinten links / Seitenwand', category: 'Links' },
  { value: 'Schweller links', label: 'Schweller links / Einstieg', category: 'Links' },
  { value: 'Seitenspiegel links', label: 'Seitenspiegel links', category: 'Links' },
  { value: 'Kotflügel vorne rechts', label: 'Kotflügel vorne rechts', category: 'Rechts' },
  { value: 'Tür vorne rechts', label: 'Tür vorne rechts (Beifahrertür)', category: 'Rechts' },
  { value: 'Tür hinten rechts', label: 'Tür hinten rechts', category: 'Rechts' },
  { value: 'Kotflügel hinten rechts', label: 'Kotflügel hinten rechts / Seitenwand', category: 'Rechts' },
  { value: 'Schweller rechts', label: 'Schweller rechts / Einstieg', category: 'Rechts' },
  { value: 'Seitenspiegel rechts', label: 'Seitenspiegel rechts', category: 'Rechts' },
  { value: 'Stoßstange hinten', label: 'Stoßstange hinten / Heckschürze', category: 'Heck' },
  { value: 'Kofferraumdeckel / Heckklappe', label: 'Kofferraumdeckel / Heckklappe', category: 'Heck' },
  { value: 'Rückleuchte links', label: 'Rückleuchte links', category: 'Heck' },
  { value: 'Rückleuchte rechts', label: 'Rückleuchte rechts', category: 'Heck' },
  { value: 'Heckscheibe', label: 'Heckscheibe', category: 'Glas' },
  { value: 'Alufelge vorne links', label: 'Alufelge vorne links', category: 'Räder' },
  { value: 'Alufelge vorne rechts', label: 'Alufelge vorne rechts', category: 'Räder' },
  { value: 'Alufelge hinten links', label: 'Alufelge hinten links', category: 'Räder' },
  { value: 'Alufelge hinten rechts', label: 'Alufelge hinten rechts', category: 'Räder' },
  { value: 'A-Säule / B-Säule / C-Säule', label: 'A-Säule / B-Säule / C-Säule', category: 'Karosserie' },
  { value: 'Unterboden / Auspuffanlage', label: 'Unterboden / Auspuffanlage', category: 'Mechanik' },
  { value: 'Fahrersitz / Sitzwange', label: 'Fahrersitz / Sitzwange', category: 'Innenraum' },
  { value: 'Beifahrersitz', label: 'Beifahrersitz', category: 'Innenraum' },
  { value: 'Rücksitzbank', label: 'Rücksitzbank', category: 'Innenraum' },
  { value: 'Lenkrad / Schaltknauf', label: 'Lenkrad / Schaltknauf', category: 'Innenraum' },
  { value: 'Armaturenbrett / Mittelkonsole', label: 'Armaturenbrett / Mittelkonsole', category: 'Innenraum' },
  { value: 'Dachhimmel', label: 'Dachhimmel / Sonnenblende', category: 'Innenraum' },
  { value: 'Kofferraumauskleidung', label: 'Kofferraumauskleidung / Ladekante', category: 'Innenraum' }
];

export const DAMAGE_TYPE_OPTIONS: ComboboxOption[] = [
  { value: 'Delle / Beule', label: 'Delle / Beule', badge: 'Dellendrücken' },
  { value: 'Kratzer / Schramme', label: 'Kratzer / Schramme', badge: 'Smart-Repair' },
  { value: 'Lackschaden / Steinschlag', label: 'Lackschaden / Steinschlag', badge: 'Lackierung' },
  { value: 'Rost / Korrosion', label: 'Rost / Korrosion', badge: 'Instandsetzung' },
  { value: 'Unfallschaden / Strukturverzug', label: 'Unfallschaden / Strukturverzug', badge: 'Großschaden' },
  { value: 'Nachlackierung (Vorherige Reparatur)', label: 'Nachlackierung (Vorschaden behoben)' },
  { value: 'Bordsteinschaden / Felgenkratzer', label: 'Bordsteinschaden / Felgenkratzer', badge: 'Felgendoktor' },
  { value: 'Riss / Bruch / Spaltmaß ungleich', label: 'Riss / Bruch / Spaltmaß ungleich' },
  { value: 'Hagelschaden (Multiple Dellen)', label: 'Hagelschaden (Multiple Dellen)' },
  { value: 'Steinschlag im Sichtfeld', label: 'Steinschlag im Sichtfeld (Scheibentausch)' },
  { value: 'Brandloch / Polsterfleck', label: 'Brandloch / Polsterfleck (Polster)' },
  { value: 'Lederabrieb / Abnutzung', label: 'Lederabrieb / Abnutzung' },
  { value: 'Elektronikfehler / Sensor defekt', label: 'Elektronikfehler / Sensor defekt' },
  { value: 'Ölverlust / Undichtigkeit', label: 'Ölverlust / Undichtigkeit' },
  { value: 'Verschleiß an Verschleißgrenze', label: 'Verschleiß an Verschleißgrenze' }
];

export const DAMAGE_SEVERITY_OPTIONS: ComboboxOption[] = [
  { value: 'Leicht', label: 'Leicht (Gebrauchsspur / Optischer Mangel)', badge: 'Gering' },
  { value: 'Mittel', label: 'Mittel (Smart-Repair / Reparatur empfohlen)', badge: 'Aufbereitung' },
  { value: 'Schwer', label: 'Schwer (Instandsetzung / Austausch zwingend erforderlich)', badge: 'Instandsetzung' },
  { value: 'Bagatelle', label: 'Bagatelle (Altersübliche normale Gebrauchsspur)' }
];
