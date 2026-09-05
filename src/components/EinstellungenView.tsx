import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Percent, 
  ShieldCheck, 
  Landmark, 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  GripVertical, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Key, 
  Eye, 
  EyeOff, 
  FileText, 
  Star, 
  Copy, 
  Save, 
  Info, 
  RefreshCw, 
  Car, 
  Lock, 
  UserCheck, 
  UserX, 
  X,
  FileCheck,
  Shield,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  FileUp,
  XCircle,
  Calculator,
  Sliders,
  PenTool,
  FolderArchive
} from 'lucide-react';
import { 
  SettingsSubTab, 
  MerchantSettings, 
  AdditionalLocation, 
  RedLicensePlate, 
  AppUser, 
  TextTemplate, 
  TextTemplateCategory,
  InvoiceTextTemplate
} from '../types';
import { firebaseService } from '../services/firebaseService';
import { SignaturePadModal } from './operationen/SignaturePadModal';
import { compressImage } from '../utils/mediaProcessor';

// Modularized Settings Tabs
import { FirmaSettingsTab } from './settings/FirmaSettingsTab';
import { AdresseSettingsTab } from './settings/AdresseSettingsTab';
import { KontaktSettingsTab } from './settings/KontaktSettingsTab';
import { SteuerSettingsTab } from './settings/SteuerSettingsTab';
import { BankSettingsTab } from './settings/BankSettingsTab';
import { KasseSettingsTab } from './settings/KasseSettingsTab';
import { StandorteSettingsTab } from './settings/StandorteSettingsTab';
import { RoteKennzeichenSettingsTab } from './settings/RoteKennzeichenSettingsTab';
import { BenutzerSettingsTab } from './settings/BenutzerSettingsTab';
import { TextvorlagenSettingsTab } from './settings/TextvorlagenSettingsTab';
import { SelbergestaltenSettingsTab } from './settings/SelbergestaltenSettingsTab';
import { ShowroomSettingsTab } from './settings/ShowroomSettingsTab';
import { MeineDokumenteSettingsTab } from './settings/MeineDokumenteSettingsTab';
import { WebShowroomView } from './showroom/WebShowroomView';

// Settings Modals
import { LocationModal } from './settings/modals/LocationModal';
import { PlateModal } from './settings/modals/PlateModal';
import { UserModal } from './settings/modals/UserModal';
import { TemplateModal } from './settings/modals/TemplateModal';

export const EinstellungenView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('firma');
  const [settings, setSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());
  const [textTemplates, setTextTemplates] = useState<TextTemplate[]>(() => firebaseService.getTextTemplates());
  const [currentUser, setCurrentUser] = useState<AppUser>(() => firebaseService.getCurrentUser());
  const [unlockedWithPin, setUnlockedWithPin] = useState(false);
  const [adminUnlockInput, setAdminUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Logo upload state & ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Signature upload state & ref
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [showSignatureDrawModal, setShowSignatureDrawModal] = useState(false);
  const [showShowroomPreviewModal, setShowShowroomPreviewModal] = useState(false);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubSettings = firebaseService.subscribeMerchantSettings((updated) => {
      setSettings(updated);
    });
    const unsubTemplates = firebaseService.subscribeTextTemplates((updatedTpls) => {
      setTextTemplates(updatedTpls);
    });
    const unsubUser = firebaseService.subscribeCurrentUser((u) => {
      setCurrentUser(u);
    });
    return () => {
      unsubSettings();
      unsubTemplates();
      unsubUser();
    };
  }, []);

  // Guarantee view scrolls to the very top immediately upon mounting, sub-tab or preview modal change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeSubTab, showShowroomPreviewModal, showSignatureDrawModal]);

  // Show save feedback
  const triggerSaveNotification = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // General Settings update
  const handleSaveGeneralSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    firebaseService.saveMerchantSettings(settings);
    triggerSaveNotification('Händler-Stammdaten erfolgreich in settings/haendler gespeichert.');
  };

  // Logo file processor with automatic image compression (max 800x400, high quality)
  const processLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine gültige Bilddatei (PNG, JPG, SVG, WebP) aus.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Die Dateigröße darf maximal 10 MB betragen.');
      return;
    }
    try {
      // Compress logo to optimal document header size (max 800px width, clean PNG/JPEG)
      const isPng = file.type.includes('png');
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 400,
        quality: 0.90,
        format: isPng ? 'image/png' : 'image/jpeg'
      });
      const updated = { ...settings, logoUrl: compressed.dataUrl };
      setSettings(updated);
      firebaseService.saveMerchantSettings(updated);
      triggerSaveNotification('Firmenlogo erfolgreich komprimiert, hochgeladen und für alle Rechnungen & Dokumente gespeichert.');
    } catch (err) {
      console.error('Logo compression failed, fallback to reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = { ...settings, logoUrl: base64 };
        setSettings(updated);
        firebaseService.saveMerchantSettings(updated);
        triggerSaveNotification('Firmenlogo erfolgreich hochgeladen und für alle Rechnungen & Dokumente gespeichert.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
    // reset input value so re-uploading same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated = { ...settings, logoUrl: '' };
    setSettings(updated);
    firebaseService.saveMerchantSettings(updated);
    triggerSaveNotification('Firmenlogo wurde erfolgreich entfernt.');
  };

  // Signature file processor (converts to base64 data url)
  const processSignatureFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine gültige Bilddatei (PNG, JPG, SVG, WebP) aus.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Die Dateigröße darf maximal 4 MB betragen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated = { ...settings, signatureUrl: base64 };
      setSettings(updated);
      firebaseService.saveMerchantSettings(updated);
      triggerSaveNotification('Standard-Händlerunterschrift erfolgreich gespeichert.');
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSignatureFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSignatureDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSignature(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSignatureFile(file);
    }
  };

  const handleRemoveSignature = () => {
    const updated = { ...settings, signatureUrl: '' };
    setSettings(updated);
    firebaseService.saveMerchantSettings(updated);
    triggerSaveNotification('Händlerunterschrift wurde erfolgreich entfernt.');
  };

  const handleSaveSignatureFromModal = (dataUrl: string) => {
    const updated = { ...settings, signatureUrl: dataUrl };
    setSettings(updated);
    firebaseService.saveMerchantSettings(updated);
    triggerSaveNotification('Digitale Händlerunterschrift erfolgreich gespeichert.');
  };

  // -------------------------------------------------------------
  // TAB 6: Anfangskapital Kasse & Bank (Startkapital)
  // -------------------------------------------------------------
  const [kasseInputAmount, setKasseInputAmount] = useState<number>(settings.initialCashBalance || 5000);
  const [kasseInputDate, setKasseInputDate] = useState<string>(settings.initialCashDate || new Date().toISOString().split('T')[0]);
  const [bankInputAmount, setBankInputAmount] = useState<number>(settings.initialBankBalance || 145000);
  const [bankInputDate, setBankInputDate] = useState<string>(settings.initialBankDate || new Date().toISOString().split('T')[0]);

  const handleRegisterInitialCash = () => {
    if (kasseInputAmount < 0) {
      alert('Bitte geben Sie einen gültigen Kassen-Anfangsbestand ein.');
      return;
    }
    const result = firebaseService.registerInitialCashInKasse(kasseInputAmount, kasseInputDate);
    setSettings(result.settings);
    triggerSaveNotification(`Anfangskapital Kasse (${kasseInputAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €) als Beleg ${result.tx.receiptNumber} verbucht.`);
  };

  const handleRegisterInitialBank = () => {
    if (bankInputAmount < 0) {
      alert('Bitte geben Sie einen gültigen Bank-Anfangsbestand ein.');
      return;
    }
    const updated = firebaseService.registerInitialBankBalance(bankInputAmount, bankInputDate);
    setSettings(updated);
    triggerSaveNotification(`Anfangskapital Bank (${bankInputAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €) für ${settings.bankName || 'Geschäftskonto'} erfolgreich in Firebase gespeichert.`);
  };

  // -------------------------------------------------------------
  // MASTER-PASSWORT & ADMINISTRATOR-SICHERHEIT (in Tab 9)
  // -------------------------------------------------------------
  const [masterPasswordInput, setMasterPasswordInput] = useState(settings.masterPassword || 'AdminMaster2026!');
  const [masterPinInput, setMasterPinInput] = useState(settings.masterPin || '4892');
  const [adminUsernameInput, setAdminUsernameInput] = useState(settings.adminUsername || 'admin.maxfleet');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showMasterPin, setShowMasterPin] = useState(false);

  const handleSaveMasterSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordInput || masterPasswordInput.length < 8) {
      alert('Das Master-Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    const updated = firebaseService.updateMasterSecurity(masterPasswordInput, masterPinInput, adminUsernameInput);
    setSettings(updated);
    triggerSaveNotification('Master-Passwort, PIN und Admin-Zugangsdaten sicher in Firebase synchronisiert.');
  };

  // -------------------------------------------------------------
  // TAB 7: Zusätzliche Standorte Modal & Logic
  // -------------------------------------------------------------
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdditionalLocation | null>(null);
  const [locationForm, setLocationForm] = useState<Partial<AdditionalLocation>>({
    name: '',
    type: 'Filiale',
    street: '',
    postalCode: '',
    city: '',
    country: 'Deutschland',
    contactPerson: '',
    phone: '',
    notes: ''
  });

  const handleOpenAddLocation = () => {
    setEditingLocation(null);
    setLocationForm({
      name: '',
      type: 'Filiale',
      street: '',
      postalCode: '',
      city: '',
      country: 'Deutschland',
      contactPerson: '',
      phone: '',
      notes: ''
    });
    setShowLocationModal(true);
  };

  const handleOpenEditLocation = (loc: AdditionalLocation) => {
    setEditingLocation(loc);
    setLocationForm(loc);
    setShowLocationModal(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationForm.name || !locationForm.street || !locationForm.city) return;

    let updatedList: AdditionalLocation[];
    if (editingLocation) {
      updatedList = (settings.additionalLocations || []).map(loc => 
        loc.id === editingLocation.id ? { ...loc, ...locationForm } as AdditionalLocation : loc
      );
    } else {
      const newLoc: AdditionalLocation = {
        id: `loc-${Date.now()}`,
        name: locationForm.name || 'Neuer Standort',
        type: locationForm.type || 'Filiale',
        street: locationForm.street || '',
        postalCode: locationForm.postalCode || '',
        city: locationForm.city || '',
        country: locationForm.country || 'Deutschland',
        contactPerson: locationForm.contactPerson || '',
        phone: locationForm.phone || '',
        isMainInvoiceAddress: false,
        notes: locationForm.notes || ''
      };
      updatedList = [...(settings.additionalLocations || []), newLoc];
    }

    const updatedSettings = firebaseService.updateMerchantSettings({ additionalLocations: updatedList });
    setSettings(updatedSettings);
    setShowLocationModal(false);
    triggerSaveNotification('Standortdaten erfolgreich aktualisiert.');
  };

  const handleDeleteLocation = (id: string) => {
    if (!confirm('Möchten Sie diesen zusätzlichen Standort wirklich entfernen?')) return;
    const updatedList = (settings.additionalLocations || []).filter(l => l.id !== id);
    const updatedSettings = firebaseService.updateMerchantSettings({ additionalLocations: updatedList });
    setSettings(updatedSettings);
    triggerSaveNotification('Standort wurde gelöscht.');
  };

  // -------------------------------------------------------------
  // TAB 8: Rote Nummernschilder Modal & Logic
  // -------------------------------------------------------------
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [editingPlate, setEditingPlate] = useState<RedLicensePlate | null>(null);
  const [plateForm, setPlateForm] = useState<Partial<RedLicensePlate>>({
    plateNumber: '',
    validUntil: '2027-12-31',
    status: 'verfuegbar',
    assignedDriver: '',
    vehicleAssigned: '',
    logbookNotes: ''
  });

  const handleOpenAddPlate = () => {
    setEditingPlate(null);
    setPlateForm({
      plateNumber: 'B-06',
      validUntil: '2027-12-31',
      status: 'verfuegbar',
      assignedDriver: '-',
      vehicleAssigned: '-',
      logbookNotes: ''
    });
    setShowPlateModal(true);
  };

  const handleOpenEditPlate = (plate: RedLicensePlate) => {
    setEditingPlate(plate);
    setPlateForm(plate);
    setShowPlateModal(true);
  };

  const handleSavePlate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateForm.plateNumber) return;

    let updatedList: RedLicensePlate[];
    if (editingPlate) {
      updatedList = (settings.redLicensePlates || []).map(p => 
        p.id === editingPlate.id ? { ...p, ...plateForm } as RedLicensePlate : p
      );
    } else {
      const newPlate: RedLicensePlate = {
        id: `plate-${Date.now()}`,
        plateNumber: plateForm.plateNumber.toUpperCase(),
        validUntil: plateForm.validUntil || '2027-12-31',
        status: (plateForm.status as RedLicensePlate['status']) || 'verfuegbar',
        assignedDriver: plateForm.assignedDriver || '-',
        vehicleAssigned: plateForm.vehicleAssigned || '-',
        logbookNotes: plateForm.logbookNotes || '',
        lastUsed: new Date().toLocaleDateString('de-DE')
      };
      updatedList = [...(settings.redLicensePlates || []), newPlate];
    }

    const updatedSettings = firebaseService.updateMerchantSettings({ redLicensePlates: updatedList });
    setSettings(updatedSettings);
    setShowPlateModal(false);
    triggerSaveNotification('Rotes Kennzeichen erfolgreich gespeichert.');
  };

  const handleDeletePlate = (id: string) => {
    if (!confirm('Möchten Sie dieses rote Kennzeichen wirklich löschen?')) return;
    const updatedList = (settings.redLicensePlates || []).filter(p => p.id !== id);
    const updatedSettings = firebaseService.updateMerchantSettings({ redLicensePlates: updatedList });
    setSettings(updatedSettings);
    triggerSaveNotification('Rotes Kennzeichen wurde entfernt.');
  };

  const handleTogglePlateStatus = (id: string) => {
    const plate = (settings.redLicensePlates || []).find(p => p.id === id);
    if (!plate) return;
    const newStatus = plate.status === 'verfuegbar' ? 'probefahrt' : 'verfuegbar';
    const updatedList = (settings.redLicensePlates || []).map(p => 
      p.id === id ? { ...p, status: newStatus, lastUsed: new Date().toLocaleDateString('de-DE') } : p
    );
    const updatedSettings = firebaseService.updateMerchantSettings({ redLicensePlates: updatedList });
    setSettings(updatedSettings);
    triggerSaveNotification(`Status von ${plate.plateNumber} geändert auf: ${newStatus === 'verfuegbar' ? 'Im Tresor verfügbar' : 'Auf Probefahrt'}`);
  };

  // -------------------------------------------------------------
  // TAB 9: Benutzerverwaltung Modal & Logic (RBAC & Passwörter)
  // -------------------------------------------------------------
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userPasswordVisible, setUserPasswordVisible] = useState(false);
  const [userPasswordConfirmVisible, setUserPasswordConfirmVisible] = useState(false);
  const [userForm, setUserForm] = useState<{
    username: string;
    name: string;
    email: string;
    role: AppUser['role'];
    roleType: 'admin' | 'mitarbeiter';
    status: 'Aktiv' | 'Inaktiv';
    password: string;
    passwordConfirm: string;
    pinCode: string;
  }>({
    username: '',
    name: '',
    email: '',
    role: 'Verkäufer',
    roleType: 'mitarbeiter',
    status: 'Aktiv',
    password: '',
    passwordConfirm: '',
    pinCode: ''
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      name: '',
      email: '',
      role: 'Verkäufer',
      roleType: 'mitarbeiter',
      status: 'Aktiv',
      password: '',
      passwordConfirm: '',
      pinCode: '1234'
    });
    setUserPasswordVisible(false);
    setUserPasswordConfirmVisible(false);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: AppUser) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      roleType: u.roleType || (u.role === 'Administrator' ? 'admin' : 'mitarbeiter'),
      status: u.status,
      password: u.password || '',
      passwordConfirm: u.password || '',
      pinCode: u.pinCode || '1234'
    });
    setUserPasswordVisible(false);
    setUserPasswordConfirmVisible(false);
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.name || !userForm.email) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (!editingUser && (!userForm.password || userForm.password.length < 8)) {
      alert('Das Passwort ist verpflichtend und muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (userForm.password && userForm.passwordConfirm && userForm.password !== userForm.passwordConfirm) {
      alert('Die eingegebenen Passwörter stimmen nicht überein.');
      return;
    }

    const isRoleAdmin = userForm.roleType === 'admin' || userForm.role === 'Administrator';
    const computedPermissions = {
      canAccessSettings: isRoleAdmin,
      canManageVehicles: true,
      canManageCustomers: userForm.role !== 'Werkstatt',
      canManageInvoices: isRoleAdmin || userForm.role === 'Buchhaltung' || userForm.role === 'Verkäufer',
      canManageFinances: isRoleAdmin || userForm.role === 'Buchhaltung'
    };

    let updatedList: AppUser[];
    if (editingUser) {
      updatedList = (settings.users || []).map(u => 
        u.id === editingUser.id ? { 
          ...u, 
          username: userForm.username.toLowerCase().trim(),
          name: userForm.name.trim(),
          email: userForm.email.toLowerCase().trim(),
          role: userForm.role,
          roleType: isRoleAdmin ? 'admin' : 'mitarbeiter',
          status: userForm.status,
          password: userForm.password || u.password,
          pinCode: userForm.pinCode || u.pinCode || '1234',
          permissions: computedPermissions
        } : u
      );
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        username: userForm.username.toLowerCase().trim(),
        name: userForm.name.trim(),
        email: userForm.email.toLowerCase().trim(),
        role: userForm.role,
        roleType: isRoleAdmin ? 'admin' : 'mitarbeiter',
        status: userForm.status,
        password: userForm.password,
        pinCode: userForm.pinCode || '1234',
        permissions: computedPermissions,
        lastLogin: 'Noch nicht angemeldet',
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedList = [...(settings.users || []), newUser];
    }

    const updatedSettings = firebaseService.updateMerchantSettings({ users: updatedList });
    setSettings(updatedSettings);
    setShowUserModal(false);
    triggerSaveNotification('Benutzerzugang & Passwörter sicher in Firebase gespeichert.');
  };

  const handleSwitchActiveUser = (u: AppUser) => {
    firebaseService.setCurrentUser(u);
    setCurrentUser(u);
    setUnlockedWithPin(false);
    triggerSaveNotification(`Aktiver Benutzer gewechselt zu: ${u.name} (${u.role})`);
  };

  const handleDeleteUser = (id: string) => {
    if ((settings.users || []).length <= 1) {
      alert('Der letzte verbleibende Administrator kann nicht gelöscht werden.');
      return;
    }
    if (!confirm('Möchten Sie diesen Benutzerzugang wirklich dauerhaft löschen?')) return;
    const updatedList = (settings.users || []).filter(u => u.id !== id);
    const updatedSettings = firebaseService.updateMerchantSettings({ users: updatedList });
    setSettings(updatedSettings);
    triggerSaveNotification('Benutzerzugang gelöscht.');
  };

  const handleToggleUserStatus = (id: string) => {
    const updatedList = (settings.users || []).map(u => 
      u.id === id ? { ...u, status: u.status === 'Aktiv' ? 'Inaktiv' : 'Aktiv' } as AppUser : u
    );
    const updatedSettings = firebaseService.updateMerchantSettings({ users: updatedList });
    setSettings(updatedSettings);
    triggerSaveNotification('Benutzerstatus aktualisiert.');
  };

  // -------------------------------------------------------------
  // TAB 10: Textvorlagen Management (Kopf- & Gewährleistungstexte)
  // -------------------------------------------------------------
  const [templateCategoryTab, setTemplateCategoryTab] = useState<TextTemplateCategory>('welcome');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TextTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<Partial<TextTemplate>>({
    title: '',
    content: '',
    category: 'welcome',
    isDefault: false
  });

  const welcomeTemplates = useMemo(() => {
    return textTemplates
      .filter(t => t.category === 'welcome')
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [textTemplates]);

  const warrantyTemplates = useMemo(() => {
    return textTemplates
      .filter(t => t.category === 'warranty')
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [textTemplates]);

  const exportTemplates = useMemo(() => {
    return textTemplates
      .filter(t => t.category === 'export')
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [textTemplates]);

  const currentCategoryList = templateCategoryTab === 'welcome' 
    ? welcomeTemplates 
    : templateCategoryTab === 'warranty' 
    ? warrantyTemplates 
    : exportTemplates;

  const handleOpenAddTemplate = () => {
    if (currentCategoryList.length >= 10) {
      alert(`Maximal 10 Vorlagen pro Kategorie erlaubt. Sie haben bereits ${currentCategoryList.length} Vorlagen angelegt.`);
      return;
    }
    setEditingTemplate(null);
    setTemplateForm({
      title: '',
      content: '',
      category: templateCategoryTab,
      isDefault: currentCategoryList.length === 0
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl: TextTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm(tpl);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.title || !templateForm.content) return;

    if (editingTemplate) {
      firebaseService.updateTextTemplate(editingTemplate.id, {
        title: templateForm.title,
        content: templateForm.content,
        isDefault: templateForm.isDefault
      });
      triggerSaveNotification('Textvorlage erfolgreich aktualisiert.');
    } else {
      const newTpl: TextTemplate = {
        id: `tpl-${templateCategoryTab === 'welcome' ? 'w' : 'b'}-${Date.now()}`,
        category: templateCategoryTab,
        title: templateForm.title,
        content: templateForm.content,
        isDefault: templateForm.isDefault || false,
        orderIndex: currentCategoryList.length,
        createdAt: new Date().toISOString()
      };
      firebaseService.saveTextTemplate(newTpl);
      triggerSaveNotification('Neue Textvorlage in textvorlagen/ angelegt.');
    }
    setShowTemplateModal(false);
  };

  const handleSetDefaultTemplate = (id: string, category: TextTemplateCategory) => {
    firebaseService.setDefaultTextTemplate(id, category);
    triggerSaveNotification('Standard-Vorlage für Rechnungen wurde aktualisiert.');
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Möchten Sie diese Textvorlage wirklich löschen?')) return;
    firebaseService.deleteTextTemplate(id);
    triggerSaveNotification('Textvorlage gelöscht.');
  };

  const handleMoveTemplate = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentCategoryList.length) return;

    const listCopy = [...currentCategoryList];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    const orderedIds = listCopy.map(t => t.id);
    firebaseService.reorderTextTemplates(templateCategoryTab, orderedIds);
    triggerSaveNotification('Reihenfolge der Vorlagen angepasst.');
  };

  // Navigation Tabs configuration
  const sidebarItems: { id: SettingsSubTab; label: string; number: number; icon: React.FC<{ className?: string }> }[] = [
    { id: 'firma', label: 'Persönliche Daten & Firma', number: 1, icon: Building2 },
    { id: 'adresse', label: 'Adresse', number: 2, icon: MapPin },
    { id: 'kontakt', label: 'Kontakt', number: 3, icon: Phone },
    { id: 'steuer', label: 'Steuer & Zoll', number: 4, icon: Percent },
    { id: 'bank', label: 'Bankverbindung', number: 5, icon: Landmark },
    { id: 'kasse', label: 'Anfangskasse (Startkapital)', number: 6, icon: Wallet },
    { id: 'standorte', label: 'Zusätzliche Standorte', number: 7, icon: Building2 },
    { id: 'rote_kennzeichen', label: 'Rote Nummernschilder', number: 8, icon: Car },
    { id: 'benutzer', label: 'Benutzerverwaltung', number: 9, icon: Users },
    { id: 'textvorlagen', label: 'Textvorlagen (Rechnungen)', number: 10, icon: FileText },
    { id: 'selbergestalten', label: 'Selber gestalten (Service-Basis & Unterkategorien)', number: 11, icon: Sliders },
    { id: 'showroom', label: 'Web-Showroom & Impressum', number: 12, icon: Globe },
    { id: 'meine_dokumente', label: 'Meine Dokumente (Firmenarchiv)', number: 13, icon: FolderArchive }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Save Toast Notification */}
      {saveToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button 
            onClick={() => setSaveToast(null)} 
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Header */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-white/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Autohaus-Konfiguration & Händler-Stammdaten</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Einstellungen & Stammdaten
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            Zentrale Verwaltung aller kaufmännischen Parameter, Kassenstände, Standorte, Kennzeichen und Textvorlagen.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveGeneralSettings()}
            className="flex items-center gap-2 px-5 py-2.5 metallic-btn-primary text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Alle Änderungen speichern</span>
          </button>
        </div>
      </div>

      {/* Structured Sidebar + Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-1.5 metallic-card-luminous p-3 rounded-3xl border border-white/30 shadow-md h-fit">
          <div className="px-3 py-2 text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>{sidebarItems.length} Einstellungsbereiche</span>
            <span className="bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border border-white/20">Firebase Sync</span>
          </div>

          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                    isActive
                      ? 'metallic-btn-primary text-slate-950 shadow-xs'
                      : 'text-slate-700 hover:bg-white/40 hover:text-slate-950'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                    isActive ? 'bg-slate-900/20 text-slate-950' : 'bg-slate-900/10 text-slate-700'
                  }`}>
                    {item.number}
                  </div>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
                  <span className="truncate flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">

          {/* 1. PERSÖNLICHE DATEN & FIRMA */}
          {activeSubTab === 'firma' && (
            <FirmaSettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveGeneralSettings={handleSaveGeneralSettings}
              logoInputRef={logoInputRef}
              signatureInputRef={signatureInputRef}
              isDraggingLogo={isDraggingLogo}
              setIsDraggingLogo={setIsDraggingLogo}
              handleLogoFileChange={handleLogoFileChange}
              handleLogoDrop={handleLogoDrop}
              handleRemoveLogo={handleRemoveLogo}
              isDraggingSignature={isDraggingSignature}
              setIsDraggingSignature={setIsDraggingSignature}
              handleSignatureFileChange={handleSignatureFileChange}
              handleSignatureDrop={handleSignatureDrop}
              handleRemoveSignature={handleRemoveSignature}
              setShowSignatureDrawModal={setShowSignatureDrawModal}
            />
          )}

          {/* 2. ADRESSE */}
          {activeSubTab === 'adresse' && (
            <AdresseSettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveGeneralSettings={handleSaveGeneralSettings}
            />
          )}

          {/* 3. KONTAKT */}
          {activeSubTab === 'kontakt' && (
            <KontaktSettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveGeneralSettings={handleSaveGeneralSettings}
            />
          )}

          {/* 4. STEUER & ZOLL */}
          {activeSubTab === 'steuer' && (
            <SteuerSettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveGeneralSettings={handleSaveGeneralSettings}
            />
          )}

          {/* 5. BANKVERBINDUNG */}
          {activeSubTab === 'bank' && (
            <BankSettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveGeneralSettings={handleSaveGeneralSettings}
              handleCopy={handleCopy}
              copiedField={copiedField}
            />
          )}

          {/* 6. STARTKAPITAL (KASSE & BANK) */}
          {activeSubTab === 'kasse' && (
            <KasseSettingsTab
              settings={settings}
              kasseInputAmount={kasseInputAmount}
              setKasseInputAmount={setKasseInputAmount}
              kasseInputDate={kasseInputDate}
              setKasseInputDate={setKasseInputDate}
              handleRegisterInitialCash={handleRegisterInitialCash}
              bankInputAmount={bankInputAmount}
              setBankInputAmount={setBankInputAmount}
              bankInputDate={bankInputDate}
              setBankInputDate={setBankInputDate}
              handleRegisterInitialBank={handleRegisterInitialBank}
            />
          )}

          {/* 7. ZUSÄTZLICHE STANDORTE */}
          {activeSubTab === 'standorte' && (
            <StandorteSettingsTab
              settings={settings}
              setActiveSubTab={setActiveSubTab}
              handleOpenAddLocation={handleOpenAddLocation}
              handleOpenEditLocation={handleOpenEditLocation}
              handleDeleteLocation={handleDeleteLocation}
            />
          )}

          {/* 8. ROTE NUMMERNSCHILDER */}
          {activeSubTab === 'rote_kennzeichen' && (
            <RoteKennzeichenSettingsTab
              settings={settings}
              handleOpenAddPlate={handleOpenAddPlate}
              handleTogglePlateStatus={handleTogglePlateStatus}
              handleOpenEditPlate={handleOpenEditPlate}
              handleDeletePlate={handleDeletePlate}
            />
          )}

          {/* 9. BENUTZERVERWALTUNG & MASTER-SICHERHEIT */}
          {activeSubTab === 'benutzer' && (
            <BenutzerSettingsTab
              settings={settings}
              adminUsernameInput={adminUsernameInput}
              setAdminUsernameInput={setAdminUsernameInput}
              masterPasswordInput={masterPasswordInput}
              setMasterPasswordInput={setMasterPasswordInput}
              showMasterPassword={showMasterPassword}
              setShowMasterPassword={setShowMasterPassword}
              masterPinInput={masterPinInput}
              setMasterPinInput={setMasterPinInput}
              showMasterPin={showMasterPin}
              setShowMasterPin={setShowMasterPin}
              handleSaveMasterSecurity={handleSaveMasterSecurity}
              currentUser={currentUser}
              handleOpenAddUser={handleOpenAddUser}
              handleOpenEditUser={handleOpenEditUser}
              handleDeleteUser={handleDeleteUser}
              handleToggleUserStatus={handleToggleUserStatus}
              handleSwitchActiveUser={handleSwitchActiveUser}
            />
          )}

          {/* 10. TEXTVORLAGEN MANAGEMENT */}
          {activeSubTab === 'textvorlagen' && (
            <TextvorlagenSettingsTab
              handleOpenAddTemplate={handleOpenAddTemplate}
              templateCategoryTab={templateCategoryTab}
              setTemplateCategoryTab={setTemplateCategoryTab}
              welcomeTemplates={welcomeTemplates}
              warrantyTemplates={warrantyTemplates}
              exportTemplates={exportTemplates}
              currentCategoryList={currentCategoryList}
              handleMoveTemplate={handleMoveTemplate}
              handleOpenEditTemplate={handleOpenEditTemplate}
              handleDeleteTemplate={handleDeleteTemplate}
              handleSetDefaultTemplate={handleSetDefaultTemplate}
              handleCopy={handleCopy}
              copiedField={copiedField}
            />
          )}

          {/* 11. SELBER GESTALTEN (Service-Basis & Unterkategorien) */}
          {activeSubTab === 'selbergestalten' && (
            <SelbergestaltenSettingsTab
              serviceBases={settings.serviceBases || firebaseService.getServiceBases()}
              onSaveBases={(updatedBases) => {
                setSettings(prev => ({ ...prev, serviceBases: updatedBases }));
                triggerSaveNotification('Service-Basen und Unterkategorien erfolgreich gespeichert.');
              }}
              onShowToast={(msg) => triggerSaveNotification(msg)}
            />
          )}

          {/* 12. WEB-SHOWROOM & IMPRESSUM */}
          {activeSubTab === 'showroom' && (
            <ShowroomSettingsTab
              settings={settings}
              onSave={(updated, msg) => {
                setSettings(updated);
                triggerSaveNotification(msg);
              }}
              onOpenShowroomPreview={() => setShowShowroomPreviewModal(true)}
            />
          )}

          {/* 13. MEINE DOKUMENTE (FIRMEN-DOKUMENTENARCHIV) */}
          {activeSubTab === 'meine_dokumente' && (
            <MeineDokumenteSettingsTab />
          )}

        </div>
      </div>

      {/* Settings Modals */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        editingLocation={editingLocation}
        locationForm={locationForm}
        setLocationForm={setLocationForm}
        handleSaveLocation={handleSaveLocation}
      />

      <PlateModal
        isOpen={showPlateModal}
        onClose={() => setShowPlateModal(false)}
        editingPlate={editingPlate}
        plateForm={plateForm}
        setPlateForm={setPlateForm}
        handleSavePlate={handleSavePlate}
      />

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        userPasswordVisible={userPasswordVisible}
        setUserPasswordVisible={setUserPasswordVisible}
        userPasswordConfirmVisible={userPasswordConfirmVisible}
        setUserPasswordConfirmVisible={setUserPasswordConfirmVisible}
        handleSaveUser={handleSaveUser}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        editingTemplate={editingTemplate}
        templateCategoryTab={templateCategoryTab}
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        handleSaveTemplate={handleSaveTemplate}
      />

      {/* Signature Draw Modal in Settings */}
      {showSignatureDrawModal && (
        <SignaturePadModal
          isOpen={showSignatureDrawModal}
          onClose={() => setShowSignatureDrawModal(false)}
          title="Digitale Händler-Unterschrift erfassen"
          signeeName={settings.responsiblePerson || 'Inhaber / Geschäftsleitung'}
          role="Autohaus"
          onSaveSignature={handleSaveSignatureFromModal}
          initialSignature={settings.signatureUrl}
        />
      )}

      {/* Fullscreen Showroom Live Preview Modal */}
      {showShowroomPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col animate-in fade-in overflow-y-auto">
          <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live-Vorschau: {settings.companyName || 'Autohaus'} Web-Showroom</h3>
                <p className="text-[11px] text-slate-400">So erleben Ihre Kunden den Showroom und den KI-Berater MAX online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShowroomPreviewModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Vorschau schließen</span>
            </button>
          </div>
          <div className="flex-1">
            <WebShowroomView onBackToApp={() => setShowShowroomPreviewModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
