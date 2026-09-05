import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  PlusCircle, 
  Layers, 
  Users, 
  Folder, 
  FileText, 
  Settings, 
  Bell, 
  Building2, 
  ShieldCheck,
  Lock,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Plus,
  UserPlus,
  Sparkles,
  ChevronRight,
  Wallet,
  Globe
} from 'lucide-react';
import { NavTab, AppUser, MerchantSettings } from '../types';
import { firebaseService } from '../services/firebaseService';
import { aiService } from '../services/aiService';
import { QuickAddCustomerModal } from './invoices/QuickAddCustomerModal';
import { QuickAddVehicleModal } from './invoices/QuickAddVehicleModal';
import { DualLayerScanningRings } from './CoinOrbitalNode';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  stockCount: number;
  customerCount?: number;
  openInvoicesCount?: number;
  currentUser?: AppUser | null;
  onOpenMaxAi?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  stockCount,
  customerCount,
  openInvoicesCount,
  currentUser: propUser,
  onOpenMaxAi
}) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(propUser || firebaseService.getCurrentUser());
  const [settings, setSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiConnected, setAiConnected] = useState<boolean>(() => aiService.getConnectionStatus().isConnected);

  // Quick Action Modal states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubUser = firebaseService.subscribeCurrentUser((u) => {
      setCurrentUser(u);
    });
    const unsubSettings = firebaseService.subscribeMerchantSettings((s) => {
      setSettings(s);
    });
    const unsubAi = aiService.subscribeConnectionStatus((status) => {
      setAiConnected(status.isConnected);
    });
    return () => {
      unsubUser();
      unsubSettings();
      unsubAi();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('#hamburger-menu-toggle-btn')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close hamburger menu on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setShowUserDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAdmin = currentUser?.roleType === 'admin' || currentUser?.role === 'Administrator' || (currentUser?.permissions?.canAccessSettings ?? true);

  // Navigation Items matching unified architecture:
  // 1. Home
  // 2. Hub (Dokumente, Verträge & Max AI)
  // 3. Neu
  // 4. Mein Lager
  // 5. Kundenliste
  // 6. Rechnungsliste
  // 7. Finanzen
  // 8. Einstellungen
  const strictMenuNavItems: { 
    id: NavTab; 
    label: string; 
    icon: React.FC<{ className?: string }>; 
    description?: string;
    requiresAdmin?: boolean 
  }[] = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Layers, 
      description: 'Zentrale Übersicht, Händlerprofil & Liquidität' 
    },
    { 
      id: 'operationen', 
      label: 'Operationen', 
      icon: FileText, 
      description: 'Dokumenten- & Vertrags-Engine (Rechnungen, Verträge & Übergabe)' 
    },
    { 
      id: 'neu', 
      label: 'Neu', 
      icon: PlusCircle, 
      description: 'Fahrzeugaufnahme & Kaufvertragserstellung' 
    },
    { 
      id: 'lager', 
      label: 'Mein Lager', 
      icon: Car, 
      description: 'Fahrzeugbestand, Aufbereitung & Kosten' 
    },
    { 
      id: 'kunden', 
      label: 'Kundenliste', 
      icon: Users, 
      description: 'Kundenverwaltung (B2C & B2B)' 
    },
    { 
      id: 'rechnungen', 
      label: 'Rechnungsliste', 
      icon: Folder, 
      description: 'Rechnungsverwaltung, Mahnwesen & Storno' 
    },
    { 
      id: 'finanzen', 
      label: 'Finanzen', 
      icon: Wallet, 
      description: 'Kassenbuch & Barverkehr' 
    },
    { 
      id: 'showroom', 
      label: 'Web-Showroom', 
      icon: Globe, 
      description: 'Öffentlicher Online-Fahrzeugmarkt & KI-Showroom' 
    },
    { 
      id: 'einstellungen', 
      label: 'Einstellungen', 
      icon: Settings, 
      requiresAdmin: true,
      description: 'Stammdaten, Bankkonten & Benutzerrechte' 
    },
  ];

  // Filter items by RBAC permissions
  const menuItems = strictMenuNavItems.filter((item) => {
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    return true;
  });

  const handleSelectUser = (user: AppUser) => {
    firebaseService.setCurrentUser(user);
    setShowUserDropdown(false);
    if (!user.permissions.canAccessSettings && activeTab === 'einstellungen') {
      setActiveTab('home');
    }
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const currentTabLabel = strictMenuNavItems.find(item => item.id === activeTab)?.label || 'maxaxle';

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'MM';

  return (
    <>
      <header id="maxfleet-top-navbar" className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-transparent border-b border-white/30 backdrop-blur-xs shadow-[0_2px_15px_rgba(0,0,0,0.25)] shrink-0 select-none transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left Section: Hamburger Menu (Metallic circular frame) & App Name + Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              
              {/* Hamburger Menu Toggle Button - Available on all pages */}
              <div className="relative">
                <button
                  id="hamburger-menu-toggle-btn"
                  type="button"
                  aria-label="Navigation Menü öffnen"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer metallic-node ${
                    isMenuOpen
                      ? 'metallic-node-active scale-105'
                      : 'hover:scale-105'
                  }`}
                  title="Menü öffnen"
                >
                  {isMenuOpen ? (
                    <X className="w-4 h-4 transition-transform duration-200 rotate-90 scale-110 stroke-[2.5] metallic-debossed-icon" />
                  ) : (
                    <Menu className="w-4 h-4 transition-transform duration-200 stroke-[2.5] metallic-debossed-icon" />
                  )}
                </button>

                {/* Compact Vertical Dropdown Menu right underneath Hamburger Icon */}
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    <div 
                      ref={menuRef}
                      id="hamburger-vertical-menu-container"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border border-slate-300/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto space-y-2.5 text-white"
                    >
                      {/* Menu Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-500/30 px-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-900 border border-white/60 flex items-center justify-center font-black text-[10px] shadow-xs">
                            MF
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                            Hauptnavigation
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Strict Order Navigation Links */}
                      <nav className="space-y-1" aria-label="Hauptmenü">
                        {menuItems.map((item, index) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              id={`hamburger-menu-item-${item.id}`}
                              type="button"
                              onClick={() => handleNavigate(item.id)}
                              className={`w-full group px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left border ${
                                isActive
                                  ? 'bg-gradient-to-r from-emerald-400/25 to-slate-200/20 border-emerald-300/80 text-emerald-200 shadow-[0_0_15px_rgba(52, 211, 153,0.25)] font-bold'
                                  : 'bg-slate-800/80 hover:bg-slate-700/70 border-slate-600/40 hover:border-slate-400/60 text-slate-200 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isActive 
                                    ? 'bg-emerald-400 text-slate-950 font-black shadow-xs' 
                                    : 'bg-slate-700 text-slate-200 group-hover:bg-slate-600 group-hover:text-white'
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-xs truncate ${
                                      isActive ? 'text-emerald-200 font-extrabold' : 'text-slate-100'
                                    }`}>
                                      {item.label}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400">
                                      #{index + 1}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                                  isActive ? 'text-emerald-300' : 'text-slate-400'
                                }`} />
                              </div>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Menu Quick Actions Footer */}
                      <div className="pt-2 border-t border-slate-600/40 grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowAddCustomerModal(true);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-400/30 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                          <span>+ Kunde</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowAddVehicleModal(true);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-400/30 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Car className="w-3.5 h-3.5 text-emerald-300" />
                          <span>+ Fahrzeug</span>
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>

              {/* Brand Logo & Name & Subscription Badge */}
              <div 
                id="brand-logo-container"
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2.5 cursor-pointer group py-1"
                title="maxaxle - Zur Startseite"
              >
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 active:scale-95 hub-coin-node group-hover:shadow-[0_0_18px_rgba(255,255,255,0.95)]">
                  {/* Dual Layer Rotating Circular Rings around Logo */}
                  <DualLayerScanningRings
                    outerInsetClass="-inset-[5px]"
                    innerInsetClass="-inset-[2.5px]"
                  />
                  
                  {/* Recessed Concentric Inner Groove Ring */}
                  <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

                  {/* Flash Aura */}
                  <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-2xs" />

                  <span className="relative z-10 text-slate-950 font-black text-base italic hub-engraved-text">M</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight hub-engraved-text transition-colors">
                    maxaxle
                  </span>
                  <span className="inline-block text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full hub-minted-badge shadow-xs">
                    PRO
                  </span>
                </div>
              </div>

            </div>

            {/* Center / Title Section: Dealer Logo & Dealer Name in Laser-Etched Stainless Steel */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4.5 py-1 rounded-full max-w-full hub-knopf-reset-pill">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.companyName || 'Händler Logo'} 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full border border-slate-400/60 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px] border border-slate-500 shrink-0">
                  <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-200" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-black tracking-wide truncate max-w-[140px] sm:max-w-[260px] hub-engraved-text">
                {settings.companyName || 'MaxFleet Autohandelsgruppe GmbH'}
              </span>
              <span className="w-2 h-2 rounded-full jewel-emerald shrink-0 shadow-sm" title="System Verbunden" />
            </div>

            {/* Right Section: Machined Metallic Max AI, Settings Gear & User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Max AI Button - Matching exactly the Settings Gear Node */}
              {onOpenMaxAi && (
                <button
                  type="button"
                  id="navbar-max-ai-btn"
                  onClick={onOpenMaxAi}
                  title={aiConnected ? "Max AI Assistent (Verbunden & Aktiv)" : "Max AI Assistent (Offline-Modus)"}
                  aria-label="Max AI"
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hub-coin-node group hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.95)]"
                >
                  {/* Dual Layer Rotating Circular Rings */}
                  <DualLayerScanningRings
                    outerInsetClass="-inset-[6px] sm:-inset-[8px]"
                    innerInsetClass="-inset-[2.5px] sm:-inset-[3.5px]"
                  />

                  {/* Recessed Concentric Inner Groove Ring */}
                  <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

                  {/* Flash Action Hover Glow */}
                  <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-2xs" />

                  <span className="relative z-10 font-black text-[11px] sm:text-xs lowercase tracking-tight text-slate-900 hub-engraved-text select-none font-mono leading-none">
                    max
                  </span>

                  {/* Status Indicator Dot: Green when connected, Red when disconnected */}
                  <span 
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-20 shadow-xs ${
                      aiConnected 
                        ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse' 
                        : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                    }`} 
                    title={aiConnected ? 'Max AI Verbunden' : 'Max AI Nicht Verbunden'}
                  />
                </button>
              )}

              {/* 3D Settings Gear Icon in Machined Steel Node with Circular Scanning Rings & Flash Action */}
              <button
                type="button"
                onClick={() => handleNavigate('einstellungen')}
                title="Systemeinstellungen"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hub-coin-node group hover:scale-110 hover:rotate-45 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.95)]"
              >
                {/* Dual Layer Rotating Circular Rings around Gear */}
                <DualLayerScanningRings
                  outerInsetClass="-inset-[6px] sm:-inset-[8px]"
                  innerInsetClass="-inset-[2.5px] sm:-inset-[3.5px]"
                />

                {/* Recessed Concentric Inner Groove Ring */}
                <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

                {/* Flash Action Hover Glow */}
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-2xs" />

                <Settings className="relative z-10 w-4 h-4 stroke-[2.2] metallic-debossed-icon" />
              </button>

              {/* User Profile in Machined Dial */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:scale-105 transition cursor-pointer hub-knopf-reset-pill"
                >
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 text-white shadow-xs border border-slate-400/50"
                    title={`${currentUser?.name || 'Benutzer'} (${isAdmin ? 'Administrator' : 'Mitarbeiter'})`}
                  >
                    {userInitials}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 metallic-debossed-icon pr-0.5" />
                </button>

                {/* RBAC User Switcher Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border border-slate-400/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] py-2 z-50 text-xs text-white animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-600/40">
                      <div className="font-bold text-slate-100">{currentUser?.name || 'Max Mustermann'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{currentUser?.username || 'admin'}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-emerald-300 border border-slate-500/50">
                        {isAdmin ? <ShieldCheck className="w-3 h-3 text-emerald-300" /> : <Lock className="w-3 h-3 text-slate-400" />}
                        <span>{isAdmin ? 'Administrator (Vollzugriff)' : 'Mitarbeiter'}</span>
                      </div>
                    </div>

                    {/* Switch Active User List */}
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Benutzer wechseln:
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-700/40">
                      {(settings.users || []).map((u) => {
                        const isUserAdmin = u.roleType === 'admin' || u.role === 'Administrator';
                        const isSelected = currentUser?.id === u.id || currentUser?.username === u.username;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className={`w-full px-3 py-2 text-left hover:bg-slate-700/50 transition cursor-pointer flex items-center justify-between ${
                              isSelected ? 'bg-slate-700/70 font-bold text-emerald-300' : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center ${
                                isUserAdmin ? 'bg-emerald-400 text-slate-950' : 'bg-slate-600 text-slate-100'
                              }`}>
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-[11px] font-semibold leading-none">{u.name}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{u.role} &bull; {isUserAdmin ? 'Admin' : 'Mitarbeiter'}</div>
                              </div>
                            </div>
                            {isSelected && <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-600/40 px-2 space-y-1">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            handleNavigate('einstellungen');
                            setShowUserDropdown(false);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-700 text-left font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-300" />
                          <span>Einstellungen öffnen</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Animated Divider Line with Smooth Glowing Light Beam Segment (5% Width, Right-to-Left) */}
        <div id="navbar-animated-divider" className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none overflow-hidden">
          {/* Baseline Subtle Divider Line */}
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* 5% Width Luminous Glowing Light Beam Segment Travelling Continuously Right-to-Left */}
          <div 
            className="absolute top-0 bottom-0 w-[5%] min-w-[36px] max-w-[96px] rounded-full animate-luminous-beam-rtl"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 245, 200, 0.8) 25%, #ffffff 50%, rgba(255, 245, 200, 0.8) 75%, rgba(255, 255, 255, 0) 100%)',
              boxShadow: '0 0 14px 3.5px rgba(255, 255, 255, 0.95), 0 0 24px 6px rgba(16, 185, 129, 0.75), 0 0 36px 9px rgba(255, 255, 255, 0.45)'
            }}
          />
        </div>

      </header>

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <QuickAddCustomerModal 
          onClose={() => setShowAddCustomerModal(false)}
          onNavigateToCustomerList={() => {
            setShowAddCustomerModal(false);
            setActiveTab('kunden');
          }}
        />
      )}

      {/* Quick Add Vehicle Modal */}
      {showAddVehicleModal && (
        <QuickAddVehicleModal 
          onClose={() => setShowAddVehicleModal(false)}
          onNavigateToInventory={() => {
            setShowAddVehicleModal(false);
            setActiveTab('lager');
          }}
        />
      )}
    </>
  );
};

