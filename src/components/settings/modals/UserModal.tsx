import React from 'react';
import { AppUser } from '../../../types';
import {
  Users,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Save
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: AppUser | null;
  userForm: {
    name: string;
    username: string;
    email: string;
    role: AppUser['role'];
    roleType: 'admin' | 'mitarbeiter';
    password?: string;
    passwordConfirm?: string;
    pinCode?: string;
    status: 'Aktiv' | 'Inaktiv';
  };
  setUserForm: React.Dispatch<React.SetStateAction<{
    name: string;
    username: string;
    email: string;
    role: AppUser['role'];
    roleType: 'admin' | 'mitarbeiter';
    password?: string;
    passwordConfirm?: string;
    pinCode?: string;
    status: 'Aktiv' | 'Inaktiv';
  }>>;
  userPasswordVisible: boolean;
  setUserPasswordVisible: (val: boolean) => void;
  userPasswordConfirmVisible: boolean;
  setUserPasswordConfirmVisible: (val: boolean) => void;
  handleSaveUser: (e: React.FormEvent) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  userForm,
  setUserForm,
  userPasswordVisible,
  setUserPasswordVisible,
  userPasswordConfirmVisible,
  setUserPasswordConfirmVisible,
  handleSaveUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-card-luminous rounded-3xl max-w-lg w-full shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col my-0 sm:my-1">
        <div className="p-5 border-b border-white/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {editingUser ? 'Benutzerzugang bearbeiten' : 'Neuen Benutzerzugang anlegen'}
              </h3>
              <p className="text-xs text-slate-700 font-semibold">Mitarbeiterzugang, Passwörter & RBAC-Berechtigungen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/60 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs overflow-y-auto">
          
          {/* Access Control Level (RBAC Selector) */}
          <div>
            <label className="block font-black text-slate-900 mb-1.5">
              Zugriffsstufe (Role-Based Access Control) *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, roleType: 'admin', role: 'Administrator' })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  userForm.roleType === 'admin'
                    ? 'metallic-btn-primary text-slate-950 shadow-md font-bold'
                    : 'metallic-inner-subbox border-white/60 text-slate-700 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <ShieldCheck className="w-4 h-4 metallic-debossed-icon text-slate-800 shrink-0" />
                  <span>Administrator</span>
                </div>
                <span className="text-[10px] text-slate-700 font-semibold mt-1">Voller Zugriff auf alle Bereiche inkl. Einstellungen</span>
              </button>

              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, roleType: 'mitarbeiter', role: userForm.role === 'Administrator' ? 'Verkäufer' : userForm.role })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  userForm.roleType === 'mitarbeiter'
                    ? 'metallic-btn-primary text-slate-950 shadow-md font-bold'
                    : 'metallic-inner-subbox border-white/60 text-slate-700 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Users className="w-4 h-4 metallic-debossed-icon text-slate-800 shrink-0" />
                  <span>Mitarbeiter</span>
                </div>
                <span className="text-[10px] text-slate-700 font-semibold mt-1">Lager, Kunden & Verträge, <strong>OHNE</strong> Einstellungen</span>
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-900 mb-1">Vollständiger Name *</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Max Mustermann"
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              />
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-1">Benutzername (Login) *</label>
              <input
                type="text"
                required
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="m.mustermann"
                className="metallic-input w-full p-2.5 rounded-xl font-mono font-bold text-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-900 mb-1">E-Mail-Adresse *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="m.mustermann@autohaus.de"
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              />
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-1">Funktionsbezeichnung</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as AppUser['role'] })}
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              >
                {userForm.roleType === 'admin' ? (
                  <option value="Administrator">Administrator (Geschäftsführung)</option>
                ) : (
                  <>
                    <option value="Verkäufer">Verkäufer (Vertrieb & Verträge)</option>
                    <option value="Buchhaltung">Buchhaltung & Kasse</option>
                    <option value="Werkstatt">Werkstatt & Aufbereitung</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Password & Security Credentials */}
          <div className="metallic-inner-subbox p-3.5 rounded-2xl border border-white/60 space-y-3 shadow-sm">
            <div className="font-black text-slate-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
                <span>Passwort & Zugangsdaten</span>
              </span>
              <span className="text-[10px] text-slate-600 font-semibold">Min. 8 Zeichen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-900 mb-1 text-[11px]">
                  {editingUser ? 'Neues Passwort (optional)' : 'Passwort *'}
                </label>
                <div className="relative">
                  <input
                    type={userPasswordVisible ? 'text' : 'password'}
                    required={!editingUser}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="metallic-input w-full p-2 pr-9 rounded-xl font-mono text-xs font-bold text-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => setUserPasswordVisible(!userPasswordVisible)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                  >
                    {userPasswordVisible ? <EyeOff className="w-3.5 h-3.5 metallic-debossed-icon" /> : <Eye className="w-3.5 h-3.5 metallic-debossed-icon" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1 text-[11px]">
                  Passwort bestätigen *
                </label>
                <div className="relative">
                  <input
                    type={userPasswordConfirmVisible ? 'text' : 'password'}
                    required={!editingUser || Boolean(userForm.password)}
                    value={userForm.passwordConfirm}
                    onChange={(e) => setUserForm({ ...userForm, passwordConfirm: e.target.value })}
                    placeholder="••••••••••••"
                    className="metallic-input w-full p-2 pr-9 rounded-xl font-mono text-xs font-bold text-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => setUserPasswordConfirmVisible(!userPasswordConfirmVisible)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                  >
                    {userPasswordConfirmVisible ? <EyeOff className="w-3.5 h-3.5 metallic-debossed-icon" /> : <Eye className="w-3.5 h-3.5 metallic-debossed-icon" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-1 text-[11px]">
                4-Stelliger Schnell-PIN (z.B. für Kasse & Terminal)
              </label>
              <input
                type="text"
                maxLength={4}
                value={userForm.pinCode}
                onChange={(e) => setUserForm({ ...userForm, pinCode: e.target.value })}
                placeholder="1234"
                className="metallic-input w-32 p-2 rounded-xl font-mono text-center tracking-widest font-black text-xs text-slate-950"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-black text-slate-900 mb-1">Konto-Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, status: 'Aktiv' })}
                className={`p-2 rounded-xl border text-center font-black transition cursor-pointer ${
                  userForm.status === 'Aktiv'
                    ? 'metallic-btn-primary text-slate-950 shadow-md'
                    : 'metallic-inner-subbox border-white/60 text-slate-700 hover:text-slate-950'
                }`}
              >
                Aktiv
              </button>
              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, status: 'Inaktiv' })}
                className={`p-2 rounded-xl border text-center font-black transition cursor-pointer ${
                  userForm.status === 'Inaktiv'
                    ? 'metallic-btn-primary text-slate-950 shadow-md'
                    : 'metallic-inner-subbox border-white/60 text-slate-700 hover:text-slate-950'
                }`}
              >
                Inaktiv
              </button>
            </div>
          </div>

          {/* Permission Preview Pill */}
          <div className="metallic-inner-subbox p-3 rounded-2xl border border-white/60 text-[11px] space-y-1 shadow-sm">
            <div className="font-black text-slate-950 flex items-center justify-between">
              <span>Berechtigungs-Vorschau:</span>
              <span className={userForm.roleType === 'admin' ? 'text-slate-950 font-black' : 'text-slate-800 font-black'}>
                {userForm.roleType === 'admin' ? 'Voller Zugriff' : 'Eingeschränkt (Mitarbeiter)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-slate-700 font-semibold">
              <div className="flex items-center gap-1">
                {userForm.roleType === 'admin' ? <Check className="w-3 h-3 metallic-debossed-icon text-emerald-700" /> : <X className="w-3 h-3 metallic-debossed-icon text-rose-600" />}
                <span>Einstellungen & Stammdaten</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 metallic-debossed-icon text-emerald-700" />
                <span>Fahrzeuge & Lagerbestand</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 metallic-debossed-icon text-emerald-700" />
                <span>Kunden & Vorgänge</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 metallic-debossed-icon text-emerald-700" />
                <span>Operationen & Verträge</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/30 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-950 font-black rounded-xl transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="metallic-btn-primary px-5 py-2 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 metallic-debossed-icon" />
              <span>Benutzerzugang speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
