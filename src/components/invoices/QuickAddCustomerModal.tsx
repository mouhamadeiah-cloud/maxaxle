import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Customer } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface QuickAddCustomerModalProps {
  onClose: () => void;
  onCustomerAdded?: (customer: Customer) => void;
  onNavigateToCustomerList?: () => void;
}

export const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({
  onClose,
  onCustomerAdded,
  onNavigateToCustomerList
}) => {
  const [type, setType] = useState<'B2C' | 'B2B'>('B2C');
  const [salutation, setSalutation] = useState<'Herr' | 'Frau' | 'Firma'>('Herr');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [vatId, setVatId] = useState('');
  const [notes, setNotes] = useState('');

  const [savedSuccess, setSavedSuccess] = useState<Customer | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerDisplayName = type === 'B2B' && companyName.trim()
      ? (name.trim() ? `${companyName.trim()} (${name.trim()})` : companyName.trim())
      : name.trim();

    if (!customerDisplayName) {
      alert('Bitte geben Sie einen Kundennamen oder Firmennamen ein.');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      type,
      salutation: type === 'B2B' ? 'Firma' : salutation,
      name: customerDisplayName,
      companyName: type === 'B2B' ? companyName.trim() : undefined,
      email: email.trim() || 'kunde@beispiel.de',
      phone: phone.trim() || '+49 30 123456',
      street: street.trim() || 'Hauptstraße 1',
      postalCode: postalCode.trim() || '10115',
      city: city.trim() || 'Berlin',
      country: 'Deutschland',
      vatId: type === 'B2B' && vatId.trim() ? vatId.trim() : undefined,
      purchasesCount: 0,
      totalSpent: 0,
      lastContact: 'Heute neu angelegt'
    };

    firebaseService.saveCustomer(newCustomer);
    setSavedSuccess(newCustomer);
    if (onCustomerAdded) {
      onCustomerAdded(newCustomer);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-0 sm:my-1 max-h-[92vh] flex flex-col text-[#0e264b]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <div className="flex items-center -space-x-1">
                <Plus className="w-4 h-4 text-[#0e264b] stroke-[3] metallic-debossed-icon" />
                <User className="w-4 h-4 text-[#0e264b] metallic-debossed-icon" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">Neuen Kunden anlegen</h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Schnellerfassung für Kundenstamm & Verträge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0e264b] hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-300">
              <CheckCircle2 className="w-8 h-8 metallic-debossed-icon" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0e264b]">Kunde erfolgreich gespeichert!</h3>
              <p className="text-xs text-[#1e3a5f]/80 max-w-sm mx-auto">
                <strong className="text-[#0e264b] font-bold">{savedSuccess.name}</strong> wurde in die Kundendatenbank und Firebase übernommen.
              </p>
            </div>

            <div className="metallic-card p-4 rounded-2xl border border-slate-300/80 text-left text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-[#1e3a5f]/70 font-semibold">Typ:</span>
                <span className="font-black text-[#0e264b]">{savedSuccess.type === 'B2B' ? 'B2B Gewerbe' : 'B2C Privatkunde'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1e3a5f]/70 font-semibold">Telefon:</span>
                <span className="font-mono font-bold text-[#0e264b]">{savedSuccess.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1e3a5f]/70 font-semibold">E-Mail:</span>
                <span className="font-mono font-bold text-[#0e264b]">{savedSuccess.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1e3a5f]/70 font-semibold">Anschrift:</span>
                <span className="text-[#0e264b] font-bold">{savedSuccess.street}, {savedSuccess.postalCode} {savedSuccess.city}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSavedSuccess(null);
                  setName('');
                  setCompanyName('');
                  setEmail('');
                  setPhone('');
                  setStreet('');
                  setPostalCode('');
                  setCity('');
                  setVatId('');
                }}
                className="px-4 py-2.5 metallic-card-luminous border border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Weiteren Kunden anlegen
              </button>

              {onNavigateToCustomerList && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCustomerList();
                  }}
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Zur Kundenliste
                </button>
              )}

              {!onNavigateToCustomerList && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Schließen
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Customer Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1e3a5f]">Kundentyp</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('B2C')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    type === 'B2C'
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <User className="w-4 h-4 metallic-debossed-icon" />
                  <span>B2C Privatkunde</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('B2B')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    type === 'B2B'
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <Building2 className="w-4 h-4 metallic-debossed-icon" />
                  <span>B2B Gewerbekunde</span>
                </button>
              </div>
            </div>

            {/* B2B Company Name */}
            {type === 'B2B' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Firmenname / Handelsname *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="z.B. Autocenter Nord GmbH"
                    className="metallic-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold text-[#0e264b]"
                  />
                </div>
              </div>
            )}

            {/* Name / Contact Person */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Anrede</label>
                <select
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value as any)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                >
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Firma">Firma</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">
                  {type === 'B2B' ? 'Ansprechpartner / Name' : 'Vor- & Nachname *'}
                </label>
                <input
                  type="text"
                  required={type === 'B2C'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Sarah Lindemann"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-semibold text-[#0e264b]"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Telefonnummer</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="metallic-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">E-Mail-Adresse</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kunde@domain.de"
                    className="metallic-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Straße & Hausnummer</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="z.B. Kurfürstendamm 120"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1e3a5f]">PLZ</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10707"
                    className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#1e3a5f]">Stadt / Ort</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                    className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* B2B VAT */}
            {type === 'B2B' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">USt-IdNr. (optional für B2B / Export)</label>
                <input
                  type="text"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                  placeholder="z.B. DE 123456789"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-bold"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-300/70">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3] metallic-debossed-icon" />
                <span>Kunden speichern</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
