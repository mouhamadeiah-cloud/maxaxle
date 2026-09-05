import React from 'react';
import { MerchantSettings, AppUser } from '../../types';
import {
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Lock,
  Save,
  Users,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

interface BenutzerSettingsTabProps {
  settings: MerchantSettings;
  adminUsernameInput: string;
  setAdminUsernameInput: (val: string) => void;
  masterPasswordInput: string;
  setMasterPasswordInput: (val: string) => void;
  showMasterPassword: boolean;
  setShowMasterPassword: (val: boolean) => void;
  masterPinInput: string;
  setMasterPinInput: (val: string) => void;
  showMasterPin: boolean;
  setShowMasterPin: (val: boolean) => void;
  handleSaveMasterSecurity: (e?: React.FormEvent) => void;
  currentUser: AppUser | null;
  handleOpenAddUser: () => void;
  handleOpenEditUser: (user: AppUser) => void;
  handleDeleteUser: (id: string) => void;
  handleToggleUserStatus: (id: string) => void;
  handleSwitchActiveUser: (user: AppUser) => void;
}

export const BenutzerSettingsTab: React.FC<BenutzerSettingsTabProps> = ({
  settings,
  adminUsernameInput,
  setAdminUsernameInput,
  masterPasswordInput,
  setMasterPasswordInput,
  showMasterPassword,
  setShowMasterPassword,
  masterPinInput,
  setMasterPinInput,
  showMasterPin,
  setShowMasterPin,
  handleSaveMasterSecurity,
  currentUser,
  handleOpenAddUser,
  handleOpenEditUser,
  handleDeleteUser,
  handleToggleUserStatus,
  handleSwitchActiveUser
}) => {
  return (
    <div className="space-y-6">

      {/* SECTION 1: MASTER-ZUGANGSDATEN & ADMINISTRATOR-SICHERHEIT */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-5">
        <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 metallic-debossed-icon text-slate-800" />
              <span>9.1 Master-Passwort & Administrator-Zugangsdaten</span>
            </h2>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              Zentrales Master-Passwort und Administrator-PIN zur Absicherung sensibler Einstellungen, Finanzdaten und Kassenprüfungen.
            </p>
          </div>
          <span className="metallic-pill px-3 py-1 text-xs font-black flex items-center gap-1.5 self-start sm:self-auto text-slate-950">
            <Key className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
            <span>Master-Security</span>
          </span>
        </div>

        <form onSubmit={handleSaveMasterSecurity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-900 font-black mb-1.5">
                Admin-Benutzername *
              </label>
              <input
                type="text"
                required
                value={adminUsernameInput}
                onChange={(e) => setAdminUsernameInput(e.target.value)}
                placeholder="admin.maxfleet"
                className="metallic-input w-full p-3 rounded-xl font-mono text-sm font-bold text-slate-950"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-900 font-black">
                  Master-Passwort *
                </label>
                <span className="text-[10px] text-slate-600 font-semibold">Min. 8 Zeichen</span>
              </div>
              <div className="relative">
                <input
                  type={showMasterPassword ? 'text' : 'password'}
                  required
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="metallic-input w-full p-3 rounded-xl font-mono text-sm font-bold text-slate-950 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  {showMasterPassword ? <EyeOff className="w-4 h-4 metallic-debossed-icon" /> : <Eye className="w-4 h-4 metallic-debossed-icon" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-900 font-black">
                  Master-PIN (Schnellzugriff) *
                </label>
                <span className="text-[10px] text-slate-600 font-semibold">4-6 Ziffern</span>
              </div>
              <div className="relative">
                <input
                  type={showMasterPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="4892"
                  className="metallic-input w-full p-3 rounded-xl font-mono text-sm font-black text-slate-950 tracking-widest pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPin(!showMasterPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  {showMasterPin ? <EyeOff className="w-4 h-4 metallic-debossed-icon" /> : <Eye className="w-4 h-4 metallic-debossed-icon" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
              <span>Zuletzt synchronisiert: <strong className="text-slate-950 font-black">{settings.securityUpdatedAt ? new Date(settings.securityUpdatedAt).toLocaleString('de-DE') : 'Initial eingerichtet'}</strong></span>
            </div>
            <button
              type="submit"
              className="metallic-btn-primary px-5 py-2.5 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 metallic-debossed-icon" />
              <span>Master-Zugangsdaten speichern</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: MITARBEITER & ROLLENBASIERTE ZUGRIFFSKONTROLLE (RBAC) */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
        <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
              <Users className="w-5 h-5 metallic-debossed-icon text-slate-800" />
              <span>9.2 Benutzerverwaltung & Rollen (RBAC)</span>
            </h2>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              Granulare Berechtigungssteuerung: <strong>Administrator (Voller Zugriff)</strong> vs. <strong>Mitarbeiter (Ohne Einstellungen)</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="metallic-btn-primary px-4 py-2 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 metallic-debossed-icon" />
            <span>Neuen Benutzer anlegen</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/40 bg-white/20 text-slate-800 font-black uppercase text-[10px]">
                <th className="py-3 px-4">Benutzer & Name</th>
                <th className="py-3 px-3">E-Mail</th>
                <th className="py-3 px-3">Zugriffsstufe (RBAC)</th>
                <th className="py-3 px-3">Passwort / PIN</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {(settings.users || []).map((u) => {
                const isAdmin = u.roleType === 'admin' || u.role === 'Administrator';
                const isCurrent = currentUser?.id === u.id || currentUser?.username === u.username;
                return (
                  <tr key={u.id} className={`hover:bg-white/30 transition text-slate-800 ${isCurrent ? 'bg-white/40' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs shrink-0 shadow-xs ${
                          isAdmin ? 'bg-slate-900 text-white' : 'bg-slate-900/10 text-slate-900 border border-white/70'
                        }`}>
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-950 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="metallic-pill px-1.5 py-0.2 text-[9px] font-black text-slate-950 uppercase">
                                Aktiv
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 font-semibold">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-semibold">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="metallic-pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black text-slate-950">
                          {isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 metallic-debossed-icon text-slate-600" />
                          )}
                          <span>{isAdmin ? 'Administrator (Voller Zugriff)' : 'Mitarbeiter (Ohne Einstellungen)'}</span>
                        </span>
                        <div className="text-[10px] text-slate-600 font-medium pl-1">
                          Funktion: <strong className="text-slate-950">{u.role}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 bg-white/60 border border-white/70 rounded text-slate-900 font-mono text-[10px] flex items-center gap-1">
                          <Key className="w-3 h-3 metallic-debossed-icon text-slate-700" />
                          <span>••••••••</span>
                        </span>
                        {u.pinCode && (
                          <span className="px-1.5 py-0.5 bg-white/50 border border-white/60 rounded text-slate-700 font-mono font-bold text-[10px]" title="Schnell-PIN">
                            PIN: {u.pinCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`metallic-pill px-2.5 py-0.5 text-[10px] font-black cursor-pointer transition flex items-center gap-1 ${
                          u.status === 'Aktiv'
                            ? 'text-emerald-800'
                            : 'text-slate-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktiv' ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                        <span>{u.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSwitchActiveUser(u)}
                            className="metallic-btn-secondary px-2.5 py-1 text-slate-950 rounded-lg text-[10px] font-black transition cursor-pointer"
                            title="Diesen Benutzer jetzt aktivieren"
                          >
                            Als Benutzer testen
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-white/60 rounded-lg transition cursor-pointer"
                          title="Bearbeiten"
                        >
                          <Edit3 className="w-3.5 h-3.5 metallic-debossed-icon" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
