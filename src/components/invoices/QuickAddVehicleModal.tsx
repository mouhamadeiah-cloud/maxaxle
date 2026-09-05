import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Plus, 
  CheckCircle2, 
  Euro, 
  Gauge, 
  Calendar, 
  ShieldCheck,
  Building2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Vehicle } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface QuickAddVehicleModalProps {
  onClose: () => void;
  onVehicleAdded?: (vehicle: Vehicle) => void;
  onNavigateToInventory?: () => void;
}

export const QuickAddVehicleModal: React.FC<QuickAddVehicleModalProps> = ({
  onClose,
  onVehicleAdded,
  onNavigateToInventory
}) => {
  const [brand, setBrand] = useState('BMW');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [vin, setVin] = useState('');
  const [firstRegistration, setFirstRegistration] = useState('01/2023');
  const [mileage, setMileage] = useState<number>(45000);
  const [powerPs, setPowerPs] = useState<number>(190);
  const [fuelType, setFuelType] = useState('Diesel');
  const [transmission, setTransmission] = useState('Automatik');
  const [color, setColor] = useState('Schwarz Metallic');
  const [purchasePrice, setPurchasePrice] = useState<number>(24500);
  const [sellingPrice, setSellingPrice] = useState<number>(29900);
  const [taxType, setTaxType] = useState<'diff_25a' | 'standard_19' | 'kaufvertrag'>('diff_25a');
  const [location, setLocation] = useState('Hauptstandort Mitte');

  const [savedSuccess, setSavedSuccess] = useState<Vehicle | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim()) {
      alert('Bitte geben Sie Marke und Modell des Fahrzeugs an.');
      return;
    }

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      brand: brand.trim(),
      model: model.trim(),
      variant: variant.trim(),
      vin: vin.trim() || `WAUZZZ${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      firstRegistration: firstRegistration.trim() || '01/2023',
      mileage: Number(mileage) || 0,
      powerKw: Math.round((Number(powerPs) || 150) / 1.35962),
      powerPs: Number(powerPs) || 150,
      fuelType,
      transmission,
      color: color.trim() || 'Schwarz',
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      taxType,
      status: 'verfuegbar',
      daysInStock: 0,
      location,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      features: ['Klimaautomatik', 'LED-Scheinwerfer', 'Navigationssystem', 'Einparkhilfe (PDC)'],
      expenses: [],
      totalExpenses: 0
    };

    firebaseService.saveVehicle(newVehicle);
    setSavedSuccess(newVehicle);
    if (onVehicleAdded) {
      onVehicleAdded(newVehicle);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-0 sm:my-1 max-h-[92vh] flex flex-col text-[#0e264b]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <div className="flex items-center -space-x-1">
                <Plus className="w-4 h-4 text-[#0e264b] stroke-[3] metallic-debossed-icon" />
                <Car className="w-4 h-4 text-[#0e264b] metallic-debossed-icon" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">Neues Fahrzeug erfassen (Mein Lager)</h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Schnellaufnahme in den Fahrzeugbestand</p>
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
              <h3 className="text-lg font-black text-[#0e264b]">Fahrzeug erfolgreich im Lager angelegt!</h3>
              <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
                <strong className="text-[#0e264b] font-bold">{savedSuccess.brand} {savedSuccess.model} {savedSuccess.variant}</strong> steht jetzt als verkaufsbereit im Bestand zur Verfügung.
              </p>
            </div>

            <div className="metallic-card p-4 rounded-2xl border border-slate-300/80 text-left text-xs space-y-2 font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#1e3a5f]/70 text-[11px] block font-semibold">FIN:</span>
                  <span className="font-mono font-bold text-[#0e264b]">{savedSuccess.vin}</span>
                </div>
                <div>
                  <span className="text-[#1e3a5f]/70 text-[11px] block font-semibold">Verkaufspreis:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {savedSuccess.sellingPrice.toLocaleString('de-DE')} €
                  </span>
                </div>
                <div>
                  <span className="text-[#1e3a5f]/70 text-[11px] block font-semibold">Besteuerung:</span>
                  <span className="font-bold text-[#0e264b]">
                    {savedSuccess.taxType === 'diff_25a' ? 'Differenzbesteuert (§ 25a)' : '19% Regelbesteuerung'}
                  </span>
                </div>
                <div>
                  <span className="text-[#1e3a5f]/70 text-[11px] block font-semibold">Standort:</span>
                  <span className="text-[#0e264b] font-bold">{savedSuccess.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSavedSuccess(null);
                  setModel('');
                  setVariant('');
                  setVin('');
                }}
                className="px-4 py-2.5 metallic-card-luminous border border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Weiteres Fahrzeug anlegen
              </button>

              {onNavigateToInventory && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToInventory();
                  }}
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Zu Mein Lager
                </button>
              )}

              {!onNavigateToInventory && (
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Brand & Model */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5 space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Marke *</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-semibold text-[#0e264b]"
                >
                  <option value="Audi">Audi</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Cupra">Cupra</option>
                  <option value="Ford">Ford</option>
                  <option value="Skoda">Skoda</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Andere">Andere Marke</option>
                </select>
              </div>

              <div className="col-span-7 space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Modell / Ausführung *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="z.B. 320d xDrive M Sport"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-semibold text-[#0e264b]"
                />
              </div>
            </div>

            {/* FIN (VIN) & Variant */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Fahrgestellnummer (FIN)</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="WBA..."
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-mono uppercase font-bold text-[#0e264b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Variante / Motor</label>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="z.B. Touring Aut. 140kW"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-semibold text-[#0e264b]"
                />
              </div>
            </div>

            {/* Technical Specs: EZ, KM, PS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Erstzulassung</label>
                <input
                  type="text"
                  value={firstRegistration}
                  onChange={(e) => setFirstRegistration(e.target.value)}
                  placeholder="MM/JJJJ"
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Kilometerstand (km)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(parseInt(e.target.value) || 0)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Leistung (PS)</label>
                <input
                  type="number"
                  value={powerPs}
                  onChange={(e) => setPowerPs(parseInt(e.target.value) || 0)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-mono font-bold"
                />
              </div>
            </div>

            {/* Fuel & Transmission */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Kraftstoffart</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                >
                  <option value="Benzin">Benzin</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid (Benzin/Elektro)">Hybrid (Benzin/Elektro)</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  <option value="Elektro">Elektro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Getriebe</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="metallic-input w-full px-3 py-2 text-xs sm:text-sm text-[#0e264b] font-semibold"
                >
                  <option value="Automatik">Automatik</option>
                  <option value="Schaltgetriebe">Schaltgetriebe</option>
                  <option value="Doppelkupplung (DSG)">Doppelkupplung (DSG)</option>
                </select>
              </div>
            </div>

            {/* Pricing & Taxation */}
            <div className="metallic-card p-4 rounded-2xl border border-slate-300/80 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1e3a5f]">Einkaufspreis (€)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-mono font-bold text-[#0e264b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1e3a5f]">Verkaufspreis (€) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="metallic-input w-full px-3 py-2 text-xs sm:text-sm font-mono font-black text-emerald-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e3a5f]">Besteuerungsart</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaxType('diff_25a')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      taxType === 'diff_25a'
                        ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                        : 'metallic-card-luminous text-[#1e3a5f] border-slate-300/70 hover:bg-white/60'
                    }`}
                  >
                    Differenzbesteuert (§ 25a)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaxType('standard_19')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      taxType === 'standard_19'
                        ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                        : 'metallic-card-luminous text-[#1e3a5f] border-slate-300/70 hover:bg-white/60'
                    }`}
                  >
                    19% MwSt. Regelbesteuert
                  </button>
                </div>
              </div>
            </div>

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
                <span>Im Lager anlegen</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
