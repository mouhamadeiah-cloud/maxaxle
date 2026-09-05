import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Plus, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Customer } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface KundenSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
}

export const KundenSelectionDrawer: React.FC<KundenSelectionDrawerProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'B2C' | 'B2B'>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Quick New Customer State
  const [newType, setNewType] = useState<'B2C' | 'B2B'>('B2C');
  const [salutation, setSalutation] = useState<'Herr' | 'Frau' | 'Firma'>('Herr');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vatId, setVatId] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.postalCode && c.postalCode.toLowerCase().includes(q)) ||
        (c.vatId && c.vatId.toLowerCase().includes(q))
      );

      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, typeFilter]);

  const handleCreateAndSelectCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = newType === 'B2B' && companyName.trim()
      ? companyName.trim()
      : `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!fullName) {
      alert('Bitte geben Sie mindestens einen Namen oder Firmennamen an.');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      type: newType,
      salutation,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: companyName.trim() || undefined,
      street: street.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      country: 'Deutschland',
      phone: phone.trim(),
      email: email.trim(),
      vatId: vatId.trim() || undefined,
      purchasesCount: 0,
      totalSpent: 0,
      lastContact: new Date().toLocaleDateString('de-DE')
    };

    firebaseService.saveCustomer(newCust);
    onSelectCustomer(newCust);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide Drawer Content */}
      <div 
        className="relative z-10 w-full max-w-xl sm:max-w-2xl metallic-modal-container text-[#0e264b] h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 border-l border-slate-300/80"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0e264b] tracking-tight">Kunde auswählen</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Pflichtfeld
                </span>
              </div>
              <p className="text-xs text-[#1e3a5f]/80 font-medium">
                Wählen Sie einen Kunden aus der Kartei oder erfassen Sie einen Neukunden
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-500 hover:text-[#0e264b] transition cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* Toggle Button for Quick Add */}
        <div className="p-4 border-b border-slate-300/70 bg-white/30 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          {!showQuickAdd ? (
            <div className="flex items-center justify-between w-full gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 metallic-debossed-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kunde, Firma, PLZ, Ort oder E-Mail suchen..."
                  className="metallic-input w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0e264b] placeholder:text-slate-400 focus:outline-none transition"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowQuickAdd(true)}
                className="metallic-btn-primary px-3.5 py-2.5 rounded-xl font-black text-xs text-[#091a34] shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 metallic-debossed-icon" />
                <span className="hidden sm:inline">Neuer Kunde</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-[#0e264b] flex items-center gap-2">
                <Plus className="w-4 h-4 metallic-debossed-icon text-emerald-700" />
                Neukunden-Schnellerfassung
              </span>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="text-xs font-bold text-[#1e3a5f] hover:text-[#0e264b] underline cursor-pointer"
              >
                Zurück zur Kundenliste
              </button>
            </div>
          )}
        </div>

        {/* Type Filter Chips (if in list mode) */}
        {!showQuickAdd && (
          <div className="px-4 py-2.5 bg-white/20 border-b border-slate-300/60 flex items-center gap-2 text-xs shrink-0">
            <span className="text-[11px] font-bold text-[#1e3a5f]/70 mr-1">Filter:</span>
            {(['all', 'B2C', 'B2B'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer border ${
                  typeFilter === t
                    ? 'metallic-btn-primary text-[#091a34] shadow-xs'
                    : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                }`}
              >
                {t === 'all' && `Alle (${customers.length})`}
                {t === 'B2C' && `Privatkunden (${customers.filter(c => c.type === 'B2C').length})`}
                {t === 'B2B' && `Geschäftskunden (${customers.filter(c => c.type === 'B2B').length})`}
              </button>
            ))}
          </div>
        )}

        {/* Drawer Body: Quick Form OR List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {showQuickAdd ? (
            /* Quick Add Form */
            <form onSubmit={handleCreateAndSelectCustomer} className="space-y-4 metallic-card border border-slate-300/80 p-5 rounded-3xl">
              <div className="flex items-center gap-4 pb-3 border-b border-slate-300/70">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0e264b]">
                  <input
                    type="radio"
                    name="quickType"
                    checked={newType === 'B2C'}
                    onChange={() => setNewType('B2C')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Privatkunde (B2C)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0e264b]">
                  <input
                    type="radio"
                    name="quickType"
                    checked={newType === 'B2B'}
                    onChange={() => setNewType('B2B')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Geschäftskunde (B2B)</span>
                </label>
              </div>

              {newType === 'B2B' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Firmenname *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="z. B. Autohaus Nord GmbH"
                    className="metallic-input w-full px-3 py-2 text-xs font-bold text-[#0e264b] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Vorname</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Max"
                    className="metallic-input w-full px-3 py-2 text-xs font-bold text-[#0e264b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Nachname *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mustermann"
                    className="metallic-input w-full px-3 py-2 text-xs font-bold text-[#0e264b] focus:outline-none"
                    required={newType === 'B2C'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Straße & Hausnummer</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Musterstr. 12"
                    className="metallic-input w-full px-3 py-2 text-xs text-[#0e264b] focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">PLZ</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10115"
                    className="metallic-input w-full px-3 py-2 text-xs font-mono text-[#0e264b] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Stadt / Ort</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                    className="metallic-input w-full px-3 py-2 text-xs text-[#0e264b] focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">Telefonnummer</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="metallic-input w-full px-3 py-2 text-xs text-[#0e264b] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">E-Mail Adresse</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kunde@example.de"
                    className="metallic-input w-full px-3 py-2 text-xs text-[#0e264b] focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1e3a5f] mb-1">USt-IdNr. (optional)</label>
                  <input
                    type="text"
                    value={vatId}
                    onChange={(e) => setVatId(e.target.value)}
                    placeholder="DE123456789"
                    className="metallic-input w-full px-3 py-2 text-xs font-mono text-[#0e264b] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="metallic-card-luminous border border-slate-300/70 hover:bg-white/60 px-4 py-2 text-[#1e3a5f] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="metallic-btn-primary px-5 py-2 text-[#091a34] font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 metallic-debossed-icon" />
                  <span>Kunde anlegen & übernehmen</span>
                </button>
              </div>
            </form>
          ) : (
            /* Customer Search Results */
            filteredCustomers.length === 0 ? (
              <div className="text-center py-16 space-y-3 metallic-card border border-slate-300/80 rounded-3xl p-6">
                <User className="w-12 h-12 text-slate-400 mx-auto stroke-1 metallic-debossed-icon" />
                <div className="text-sm font-bold text-[#0e264b]">Keine Kunden gefunden</div>
                <p className="text-xs text-[#1e3a5f]/70 max-w-xs mx-auto">
                  Legen Sie einen neuen Kunden über die Schnellerfassung an oder passen Sie den Suchbegriff an.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(true)}
                  className="metallic-btn-primary mt-2 px-4 py-2 text-[#091a34] font-black text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4 metallic-debossed-icon" />
                  <span>Jetzt neuen Kunden anlegen</span>
                </button>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                const isB2B = cust.type === 'B2B';

                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    className={`group p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'metallic-card-luminous border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                        : 'metallic-card border-slate-300/80 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl metallic-node flex items-center justify-center font-black shrink-0 shadow-xs">
                        {isB2B ? <Building2 className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" /> : <User className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-[#0e264b] group-hover:text-blue-950 transition-colors truncate">
                            {cust.name}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs ${
                            isB2B ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {isB2B ? 'B2B Firma' : 'B2C Privat'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#1e3a5f] truncate font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 metallic-debossed-icon" />
                          <span>{cust.street ? `${cust.street}, ` : ''}{cust.postalCode} {cust.city || 'Deutschland'}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#1e3a5f]/70 truncate font-medium">
                          {cust.phone && <span>Tel: {cust.phone}</span>}
                          {cust.email && <span>E-Mail: {cust.email}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-[#0e264b] group-hover:text-blue-900 group-hover:translate-x-1 transition-all shrink-0">
                      <span>Auswählen</span>
                      <ArrowRight className="w-3.5 h-3.5 metallic-debossed-icon" />
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 border-t border-slate-300/70 bg-white/40 backdrop-blur-xs flex items-center justify-between text-xs text-[#1e3a5f] font-semibold shrink-0">
          <span>{filteredCustomers.length} Kunden in der Kartei</span>
          <button
            type="button"
            onClick={onClose}
            className="metallic-card-luminous border border-slate-300/70 hover:bg-white/60 px-4 py-2 text-[#1e3a5f] font-bold rounded-xl transition cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
