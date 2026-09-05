import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  User, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Shield, 
  FileSignature, 
  ChevronDown, 
  Sparkles, 
  Printer, 
  Check, 
  X,
  Euro
} from 'lucide-react';
import { Customer, OperationVehicleItem, OperationDocumentType } from '../../types';

export const GREETING_TEMPLATES = [
  { id: 'standard_car', title: 'Standard Fahrzeugkauf (Sehr geehrte Damen und Herren)', text: 'Sehr geehrte Damen und Herren,\n\nwir bedanken uns für Ihren Auftrag und das entgegengebrachte Vertrauen. Nachfolgend stellen wir Ihnen das vereinbarte Fahrzeug gemäß Kaufvertrag in Rechnung.' },
  { id: 'b2b_dealer', title: 'Händler / B2B Export Übergabe', text: 'Sehr geehrte Geschäftspartner,\n\nwir bedanken uns für den partnerschaftlichen Handel. Vereinbarungsgemäß berechnen wir die nachstehenden Fahrzeugpositionen.' },
  { id: 'formal_du', title: 'Persönliche Kundenansprache', text: 'Hallo und herzlichen Glückwunsch zum neuen Fahrzeug! Wir freuen uns sehr über Ihren Kauf und wünschen stets eine sichere und gute Fahrt.' }
];

export const WARRANTY_TEMPLATES = [
  { id: 'b2c_12m', title: '12 Monate Sachmängelhaftung (B2C Standard)', text: 'Für dieses Gebrauchtfahrzeug gilt die gesetzliche Sachmängelhaftung von 12 Monaten ab Übergabe gem. BGB.' },
  { id: 'b2b_excl', title: 'Gewerblicher Verkauf (Ausschluss)', text: 'Gewerblicher Verkauf / B2B: Der Verkauf erfolgt unter vollständigem Ausschluss jeglicher Sachmängelhaftung und Gewährleistung.' },
  { id: 'export_excl', title: 'Export- & Händlerkauf', text: 'Fahrzeugverkauf für Export / Wiederverkäufer. Ausschluss jeglicher Gewährleistung und Rücknahme.' },
  { id: 'garantie_plus', title: 'Inklusive 24 Monate Premium-Garantie', text: 'Inklusive 24 Monate europaweite Gebrauchtwagengarantie gemäß den beiliegenden Garantiebedingungen der CarGarantie.' }
];

export interface InvoiceCardStackProps {
  selectedDocId: OperationDocumentType;
  vehicle: OperationVehicleItem | null;
  customer: Customer | null;
  onOpenVehicleDrawer: () => void;
  onChangeVehiclePrice?: (price: number) => void;
  onOpenCustomerDrawer: () => void;
  onRemoveCustomer: () => void;
  docNumber: string;
  datum: string;

  lieferdatum: string;
  setLieferdatum: (date: string) => void;
  zahlungsziel: string;
  setZahlungsziel: (target: string) => void;

  begruessungstext: string;
  setBegruessungstext: (text: string) => void;
  gewaehrleistung: string;
  setGewaehrleistung: (text: string) => void;
  sondervereinbarung: string;
  setSondervereinbarung: (text: string) => void;

  calc: {
    totalNet: number;
    totalTax: number;
    totalGross: number;
  };

  onOpenPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const InvoiceCardStack: React.FC<InvoiceCardStackProps> = ({
  vehicle,
  customer,
  onOpenVehicleDrawer,
  onChangeVehiclePrice,
  onOpenCustomerDrawer,
  onRemoveCustomer,
  docNumber,
  datum,

  lieferdatum,
  setLieferdatum,
  zahlungsziel,
  setZahlungsziel,

  begruessungstext,
  setBegruessungstext,
  gewaehrleistung,
  setGewaehrleistung,
  sondervereinbarung,
  setSondervereinbarung,

  calc,
  onOpenPreview,
  onSave,
  isSaving
}) => {
  const [showZahlungszielMenu, setShowZahlungszielMenu] = useState(false);
  const [isCustomZahlungsziel, setIsCustomZahlungsziel] = useState(false);

  const [showGreetingMenu, setShowGreetingMenu] = useState(false);
  const [showWarrantyMenu, setShowWarrantyMenu] = useState(false);

  return (
    <div className="flex flex-col space-y-4 z-10 w-full animate-in fade-in duration-300">
      
      {/* CARD 1: FAHRZEUG / POSITION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-30">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Fahrzeug / Position</h4>
          </div>
          {vehicle?.brand && (
            <button
              type="button"
              onClick={onOpenVehicleDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Fahrzeug ändern
            </button>
          )}
        </div>

        {vehicle?.brand ? (
          <div className="space-y-2.5">
            {/* Vehicle Info Box */}
            <div className="p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
              <div className="font-bold text-white text-sm">
                {vehicle.brand} {vehicle.model} {vehicle.variant || ''}
              </div>
              <div className="text-emerald-200/70 text-[11px] font-mono mt-0.5">
                VIN: {vehicle.vin || 'Keine VIN'} • {vehicle.mileage?.toLocaleString('de-DE')} km {vehicle.firstRegistration ? `• EZ: ${vehicle.firstRegistration}` : ''}
              </div>
            </div>

            {/* Integrated Editable Price Field */}
            <div className="p-3 rounded-xl bg-[#01140e]/90 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verkaufspreis / Fahrzeugpreis (€)</span>
                </label>
                <span className="text-[10px] font-medium text-emerald-300/70">
                  Aus Bestandsdaten geladen • Jederzeit anpassbar
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="input-invoice-vehicle-price"
                  value={vehicle.sellingPrice || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (onChangeVehiclePrice) {
                      onChangeVehiclePrice(val);
                    }
                  }}
                  placeholder="0,00"
                  className="w-full pl-4 pr-12 py-2.5 bg-[#021d15] border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 rounded-xl text-white font-mono text-base font-black outline-none transition"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm pointer-events-none">
                  €
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-200/70 pt-0.5">
                <span>Betrag formatiert:</span>
                <span className="font-mono font-bold text-amber-300">
                  {(vehicle.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVehicleDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <Car className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Fahrzeug aus Fahrzeuglager auswählen (Preis wird auto-geladen)</span>
          </button>
        )}
      </div>

      {/* CARD 2: KUNDE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-25">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Kunde</h4>
          </div>
          {customer && (
            <button
              type="button"
              onClick={onOpenCustomerDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Kunde wechseln
            </button>
          )}
        </div>

        {customer ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                {customer.name || customer.companyName}
              </div>
              <div className="text-emerald-200/70 text-[11px] mt-0.5">
                {customer.street || 'Keine Adresse'}, {customer.postalCode || customer.zip || ''} {customer.city || ''} • Tel: {customer.phone || customer.mobile || customer.email || ''}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveCustomer}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#032318] cursor-pointer transition"
              title="Kunde entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenCustomerDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Kunde auswählen</span>
          </button>
        )}
      </div>

      {/* CARD 3: RECHNUNGSDATEN (DATUM, LIEFERDATUM, ZAHLUNGSZIEL) */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative ${
        showZahlungszielMenu ? 'z-[9995]' : 'z-20'
      }`}>
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Rechnungsdaten</h4>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold">Nr. {docNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-emerald-200/70 mb-1 block">
              Datum <span className="text-[10px] text-emerald-400 font-normal">(Fest)</span>
            </label>
            <div className="w-full px-3 py-2 rounded-xl bg-[#01140e]/80 border border-emerald-500/20 text-slate-300 font-mono font-medium flex items-center justify-between cursor-not-allowed">
              <span>{datum}</span>
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400/50" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-emerald-200/70 mb-1 block">
              Lieferdatum
            </label>
            <div className="relative">
              <input
                type="text"
                value={lieferdatum}
                onChange={(e) => setLieferdatum(e.target.value)}
                placeholder="TT.MM.JJJJ"
                className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white font-mono font-medium focus:border-amber-400 outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => {
                  const pick = prompt('Lieferdatum eingeben (TT.MM.JJJJ):', lieferdatum);
                  if (pick) setLieferdatum(pick);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white p-1 cursor-pointer"
                title="Kalender / Datum anpassen"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold text-emerald-200/70 mb-1 block">
              Zahlungsziel
            </label>
            
            {isCustomZahlungsziel ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={zahlungsziel}
                  onChange={(e) => setZahlungsziel(e.target.value)}
                  placeholder="z.B. 14 Tage netto"
                  className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-amber-400/60 text-white font-medium outline-none text-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomZahlungsziel(false)}
                  className="p-2 rounded-lg bg-[#032318] text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowGreetingMenu(false);
                  setShowWarrantyMenu(false);
                  setShowZahlungszielMenu(!showZahlungszielMenu);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white font-medium flex items-center justify-between hover:border-emerald-400 cursor-pointer"
              >
                <span className="font-bold text-amber-300">{zahlungsziel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${showZahlungszielMenu ? 'rotate-180' : ''}`} />
              </button>
            )}

            <AnimatePresence>
              {showZahlungszielMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-full mt-1.5 z-[9999] bg-[#021d15] border border-emerald-400/60 rounded-xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-1 text-xs backdrop-blur-2xl"
                >
                  {['Sofort', '7 Tage netto', '14 Tage netto', '30 Tage netto'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setZahlungsziel(option);
                        setShowZahlungszielMenu(false);
                      }}
                      className={`w-full px-2.5 py-2 text-left rounded-lg transition font-medium flex items-center justify-between cursor-pointer ${
                        zahlungsziel === option ? 'bg-amber-400/20 text-amber-300 font-bold' : 'hover:bg-[#032318] text-slate-200'
                      }`}
                    >
                      <span>{option}</span>
                      {zahlungsziel === option && <Check className="w-3.5 h-3.5 text-amber-300" />}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowZahlungszielMenu(false);
                      setIsCustomZahlungsziel(true);
                    }}
                    className="w-full px-2.5 py-2 text-left rounded-lg hover:bg-[#032318] text-emerald-300 font-bold border-t border-emerald-500/20 mt-1 cursor-pointer"
                  >
                    + Freier Text / Individuelles Ziel...
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CARD 4: BEGRÜSSUNGSTEXT */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative ${
        showGreetingMenu ? 'z-[9995]' : 'z-15'
      }`}>
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Begrüßungstext</h4>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowZahlungszielMenu(false);
                setShowWarrantyMenu(false);
                setShowGreetingMenu(!showGreetingMenu);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer"
            >
              <span>Vorlagen</span>
              <ChevronDown className="w-3 h-3 text-emerald-400" />
            </button>

            <AnimatePresence>
              {showGreetingMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1.5 z-[9999] w-[calc(100vw-3.5rem)] max-w-xs sm:w-80 bg-[#021d15] border border-emerald-400/60 rounded-xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-1 text-xs backdrop-blur-2xl"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 mb-1">
                    Textbausteine wählen
                  </div>
                  {GREETING_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setBegruessungstext(tmpl.text);
                        setShowGreetingMenu(false);
                      }}
                      className="w-full px-2.5 py-2 text-left rounded-lg hover:bg-[#032318] text-slate-200 transition font-medium cursor-pointer"
                    >
                      <div className="font-bold text-emerald-300">{tmpl.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tmpl.text.replace(/\n/g, ' ')}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <textarea
            rows={2}
            value={begruessungstext}
            onChange={(e) => setBegruessungstext(e.target.value)}
            placeholder="Begrüßungstext eingeben..."
            className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white text-xs leading-relaxed focus:border-amber-400 outline-none resize-y"
          />
        </div>
      </div>

      {/* CARD 5: GEWÄHRLEISTUNG */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative ${
        showWarrantyMenu ? 'z-[9995]' : 'z-10'
      }`}>
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Gewährleistung</h4>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowZahlungszielMenu(false);
                setShowGreetingMenu(false);
                setShowWarrantyMenu(!showWarrantyMenu);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer"
            >
              <span>Klauseln</span>
              <ChevronDown className="w-3 h-3 text-emerald-400" />
            </button>

            <AnimatePresence>
              {showWarrantyMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1.5 z-[9999] w-[calc(100vw-3.5rem)] max-w-sm sm:w-96 bg-[#021d15] border border-emerald-400/60 rounded-xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-1 text-xs backdrop-blur-2xl"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 mb-1">
                    Rechtliche Klauseln
                  </div>
                  {WARRANTY_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setGewaehrleistung(tmpl.text);
                        setShowWarrantyMenu(false);
                      }}
                      className="w-full px-2.5 py-2 text-left rounded-lg hover:bg-[#032318] text-slate-200 transition font-medium cursor-pointer"
                    >
                      <div className="font-bold text-emerald-300">{tmpl.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tmpl.text}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <textarea
            rows={2}
            value={gewaehrleistung}
            onChange={(e) => setGewaehrleistung(e.target.value)}
            placeholder="Gewährleistungsklausel eingeben..."
            className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white text-xs leading-relaxed focus:border-amber-400 outline-none resize-y"
          />
        </div>
      </div>

      {/* CARD 6: SONDERVEREINBARUNG */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-5">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Sondervereinbarung</h4>
          </div>
          <span className="text-[11px] text-emerald-300/80">Freitext</span>
        </div>

        <div>
          <textarea
            rows={2}
            value={sondervereinbarung}
            onChange={(e) => setSondervereinbarung(e.target.value)}
            placeholder="Hier können individuelle Sondervereinbarungen, Nachlässe, Inzahlungnahmen oder besondere Übergabevereinbarungen frei formuliert werden..."
            className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white text-xs leading-relaxed focus:border-amber-400 outline-none resize-y"
          />
        </div>
      </div>

      {/* BOTTOM FOOTER SECTION: ENDPREIS & DOKUMENT ERSTELLEN ACTION */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-[#021d15]/95 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Financial Summary */}
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider">
            Endpreis (Gesamtbrutto)
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {calc.totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
            {calc.totalTax > 0 && (
              <span className="text-xs text-emerald-200/70 font-mono">
                (inkl. {calc.totalTax.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € MwSt.)
              </span>
            )}
          </div>
        </div>

        {/* Actions - Single Source of Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto relative z-10 justify-end">
          <button
            type="button"
            id="btn-invoice-create-and-share"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs font-black shadow-[0_0_25px_rgba(245,197,24,0.45)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isSaving ? 'Synchronisiere & erstelle...' : 'Dokument erstellen & teilen'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
