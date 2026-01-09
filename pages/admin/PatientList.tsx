import React, { useState, useMemo } from 'react';
import {
  Search, Filter, UserPlus, ChevronLeft, Download,
  X, CheckSquare, Square, MessageSquare, Trash2, FileDown, FileHeart, Copy,
  Check, Send, Mail, Phone, Clock, AlertCircle, FileCheck
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../../components/ui';
import { usePatients, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { Patient, RiskLevel, HealthDeclarationToken, DeclarationStatus } from '../../types';

// Helper for translating status
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'low': 'נמוך',
    'medium': 'בינוני',
    'high': 'גבוה',
  };
  return map[status] || status;
};

// Helper for declaration status
const getDeclarationStatusConfig = (status?: DeclarationStatus) => {
  switch (status) {
    case 'valid':
      return { label: 'תקין', variant: 'success' as const, icon: FileCheck };
    case 'pending':
      return { label: 'ממתין', variant: 'warning' as const, icon: Clock };
    case 'expired':
      return { label: 'פג תוקף', variant: 'destructive' as const, icon: AlertCircle };
    case 'none':
    default:
      return { label: 'חסר', variant: 'outline' as const, icon: FileHeart };
  }
};

interface PatientFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
}

const INITIAL_FORM: PatientFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: 'נקבה',
};

interface FilterState {
  riskLevel: RiskLevel | 'all';
  lastVisitFrom: string;
  lastVisitTo: string;
  hasUpcomingAppointment: 'all' | 'yes' | 'no';
}

const INITIAL_FILTERS: FilterState = {
  riskLevel: 'all',
  lastVisitFrom: '',
  lastVisitTo: '',
  hasUpcomingAppointment: 'all',
};

// CSV Export utility
const exportToCSV = (patients: Patient[], filename: string) => {
  const headers = ['שם', 'טלפון', 'אימייל', 'ביקור אחרון', 'תור קרוב', 'רמת סיכון', 'תאריך הצטרפות'];
  const rows = patients.map(p => [
    p.name,
    p.phone,
    p.email,
    p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('he-IL') : '',
    p.upcomingAppointment ? new Date(p.upcomingAppointment).toLocaleDateString('he-IL') : '',
    getStatusLabel(p.riskLevel),
    p.memberSince ? new Date(p.memberSince).toLocaleDateString('he-IL') : '',
  ]);

  // Add BOM for Hebrew support in Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Health Declaration Form Data
interface HealthDeclarationFormData {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
}

const INITIAL_HEALTH_FORM: HealthDeclarationFormData = {
  patientId: undefined,
  patientName: '',
  patientPhone: '',
  patientEmail: '',
};

export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { patients, loading: patientsLoading, addPatient, deletePatient } = usePatients();
  const { createToken, generateShareLink, generateWhatsAppLink, generateEmailLink } = useHealthTokens();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Health Declaration Dialog State
  const [isHealthDeclarationOpen, setIsHealthDeclarationOpen] = useState(false);
  const [healthFormData, setHealthFormData] = useState<HealthDeclarationFormData>(INITIAL_HEALTH_FORM);
  const [generatedToken, setGeneratedToken] = useState<HealthDeclarationToken | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Text search
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);
      if (!matchesSearch) return false;

      // Risk level filter
      if (filters.riskLevel !== 'all' && p.riskLevel !== filters.riskLevel) return false;

      // Last visit date range
      if (filters.lastVisitFrom && p.lastVisit) {
        if (new Date(p.lastVisit) < new Date(filters.lastVisitFrom)) return false;
      }
      if (filters.lastVisitTo && p.lastVisit) {
        if (new Date(p.lastVisit) > new Date(filters.lastVisitTo)) return false;
      }

      // Upcoming appointment filter
      if (filters.hasUpcomingAppointment === 'yes' && !p.upcomingAppointment) return false;
      if (filters.hasUpcomingAppointment === 'no' && p.upcomingAppointment) return false;

      return true;
    });
  }, [patients, searchTerm, filters]);

  // Check if any filters are active
  const hasActiveFilters = filters.riskLevel !== 'all' ||
    filters.lastVisitFrom !== '' ||
    filters.lastVisitTo !== '' ||
    filters.hasUpcomingAppointment !== 'all';

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPatients.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const count = selectedIds.size;
    for (const id of selectedIds) {
      await deletePatient(id);
    }
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setIsDeleteConfirmOpen(false);
    setIsDeleting(false);
    showSuccess(`${count} מטופלים נמחקו`);
  };

  const handleExportSelected = () => {
    const selectedPatients = filteredPatients.filter(p => selectedIds.has(p.id));
    exportToCSV(selectedPatients, 'patients_selected');
    showSuccess(`${selectedPatients.length} מטופלים יוצאו ל-CSV`);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddPatient = async () => {
    if (!formData.firstName || !formData.phone) return;

    setSaving(true);

    const result = await addPatient({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      riskLevel: 'low',
    });

    setSaving(false);

    if (result) {
      setIsAddPatientOpen(false);
      setFormData(INITIAL_FORM);
      showSuccess('המטופל נוסף בהצלחה');
    }
  };

  // Health Declaration Handlers
  const openHealthDeclarationDialog = (patient?: Patient) => {
    if (patient) {
      setHealthFormData({
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email || '',
      });
    } else {
      setHealthFormData(INITIAL_HEALTH_FORM);
    }
    setGeneratedToken(null);
    setLinkCopied(false);
    setIsHealthDeclarationOpen(true);
  };

  const handleGenerateToken = async () => {
    if (!healthFormData.patientName || !healthFormData.patientPhone) return;

    setCreatingToken(true);
    const token = await createToken({
      patientId: healthFormData.patientId,
      patientName: healthFormData.patientName,
      patientPhone: healthFormData.patientPhone,
      patientEmail: healthFormData.patientEmail,
    });
    setCreatingToken(false);

    if (token) {
      setGeneratedToken(token);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedToken) return;
    const link = generateShareLink(generatedToken.token);
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    showSuccess('הקישור הועתק');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleSendWhatsApp = () => {
    if (!generatedToken || !healthFormData.patientPhone) return;
    const link = generateWhatsAppLink(generatedToken.token, healthFormData.patientPhone);
    // SECURITY: Use noopener,noreferrer to prevent tabnabbing attacks
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    if (!generatedToken || !healthFormData.patientEmail) return;
    const link = generateEmailLink(generatedToken.token, healthFormData.patientEmail, 'ClinicALL');
    // SECURITY: Use noopener,noreferrer to prevent tabnabbing attacks
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">מטופלים</h1>
          <p className="text-gray-600">
            ניהול תיקי לקוחות וטיפולים
            {hasActiveFilters && <span className="text-primary mr-2">({filteredPatients.length} תוצאות מסוננות)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds(new Set());
            }}
          >
            <CheckSquare className="ml-2 h-4 w-4" />
            {isSelectionMode ? 'בטל בחירה' : 'בחירה מרובה'}
          </Button>
          <Button variant="outline" onClick={() => openHealthDeclarationDialog()}>
            <FileHeart className="ml-2 h-4 w-4" /> הצהרת בריאות
          </Button>
          <Button className="shadow-sm" onClick={() => setIsAddPatientOpen(true)}>
            <UserPlus className="ml-2 h-4 w-4" /> מטופל חדש
          </Button>
        </div>
      </div>

      {/* Selection Mode Actions Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <span className="font-medium text-primary">
            {selectedIds.size} מטופלים נבחרו
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <FileDown size={16} className="ml-2" /> ייצוא ל-CSV
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare size={16} className="ml-2" /> שלח SMS
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteConfirmOpen(true)}>
              <Trash2 size={16} className="ml-2" /> מחק
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם או טלפון..."
            className="pr-9"
            name="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={hasActiveFilters ? "primary" : "outline"}
            size="sm"
            className="flex-1 relative"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="ml-2 h-3 w-3" /> סינון
            {hasActiveFilters && (
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              exportToCSV(filteredPatients, 'patients');
              showSuccess('הקובץ הורד בהצלחה');
            }}
          >
            <Download className="ml-2 h-3 w-3" /> ייצוא
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden hidden md:block">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              {isSelectionMode && (
                <th className="px-4 py-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={selectedIds.size === filteredPatients.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                  >
                    {selectedIds.size === filteredPatients.length && filteredPatients.length > 0 ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
              )}
              <th className="px-6 py-4">שם המטופל</th>
              <th className="px-6 py-4">טלפון</th>
              <th className="px-6 py-4">ביקור אחרון</th>
              <th className="px-6 py-4">הצהרת בריאות</th>
              <th className="px-6 py-4">רמת סיכון</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Loading skeleton */}
            {patientsLoading && (
              <>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-14 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-12 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8" /></td>
                  </tr>
                ))}
              </>
            )}
            {!patientsLoading && filteredPatients.map(patient => (
              <tr
                key={patient.id}
                className={`hover:bg-primary/5 transition-all cursor-pointer group border-r-2 border-r-transparent hover:border-r-primary ${
                  selectedIds.has(patient.id) ? 'bg-primary/10' : ''
                }`}
                onClick={() => !isSelectionMode && navigate(`/admin/patients/${patient.id}`)}
              >
                {isSelectionMode && (
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => toggleSelect(patient.id, e)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      aria-label={selectedIds.has(patient.id) ? 'בטל בחירה' : 'בחר'}
                    >
                      {selectedIds.has(patient.id) ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={patient.avatar} alt={`תמונת פרופיל של ${patient.name}`} className="w-8 h-8 rounded-full bg-gray-200 object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                    <div>
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-xs text-gray-500">{patient.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{patient.phone}</td>
                <td className="px-6 py-4 text-gray-500">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('he-IL') : '-'}</td>
                <td className="px-6 py-4">
                  {(() => {
                    const config = getDeclarationStatusConfig(patient.declarationStatus);
                    const StatusIcon = config.icon;
                    return (
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon size={12} />
                          {config.label}
                        </Badge>
                        {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHealthDeclarationDialog(patient);
                            }}
                          >
                            <Send size={12} className="ml-1" />
                            שלח
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'success'}>
                    {getStatusLabel(patient.riskLevel)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon" aria-label="פרטי מטופל">
                    <ChevronLeft size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile List */}
      <div className="md:hidden space-y-4">
        {/* Mobile loading skeleton */}
        {patientsLoading && (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
        {!patientsLoading && filteredPatients.map(patient => (
          <Card
            key={patient.id}
            className={`p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-all touch-manipulation hover:shadow-lg border-r-2 border-r-transparent hover:border-r-primary ${
              selectedIds.has(patient.id) ? 'bg-primary/10 border-r-primary' : ''
            }`}
            onClick={() => !isSelectionMode && navigate(`/admin/patients/${patient.id}`)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {isSelectionMode && (
                  <button
                    onClick={(e) => toggleSelect(patient.id, e)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={selectedIds.has(patient.id) ? 'בטל בחירה' : 'בחר'}
                  >
                    {selectedIds.has(patient.id) ? (
                      <CheckSquare size={22} className="text-primary" />
                    ) : (
                      <Square size={22} />
                    )}
                  </button>
                )}
                <img src={patient.avatar} alt={`תמונת פרופיל של ${patient.name}`} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                <div>
                  <div className="font-bold text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-600">{patient.phone}</div>
                </div>
              </div>
              <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'success'}>
                {getStatusLabel(patient.riskLevel)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
              <div>
                <span className="text-gray-600 block text-xs">ביקור אחרון</span>
                {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('he-IL') : '-'}
              </div>
              <div>
                <span className="text-gray-600 block text-xs">הצהרת בריאות</span>
                {(() => {
                  const config = getDeclarationStatusConfig(patient.declarationStatus);
                  const StatusIcon = config.icon;
                  return (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={config.variant} className="gap-1 text-xs">
                        <StatusIcon size={10} />
                        {config.label}
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            </div>
            {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openHealthDeclarationDialog(patient);
                }}
              >
                <Send size={14} className="ml-2" />
                שלח הצהרת בריאות
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} title="הוספת מטופל חדש">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם פרטי</Label>
              <Input
                name="given-name"
                autoComplete="given-name"
                placeholder="ישראל"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>שם משפחה</Label>
              <Input
                name="family-name"
                autoComplete="family-name"
                placeholder="ישראלי"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>טלפון נייד</Label>
            <Input
              type="tel"
              name="tel"
              autoComplete="tel"
              placeholder="050-0000000"
              className="direction-ltr"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label>אימייל</Label>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="email@example.com"
              className="direction-ltr"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך לידה</Label>
              <Input
                type="date"
                name="bday"
                autoComplete="bday"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>מגדר</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option>נקבה</option>
                <option>זכר</option>
                <option>אחר</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsAddPatientOpen(false)} disabled={saving}>
              ביטול
            </Button>
            <Button
              onClick={handleAddPatient}
              disabled={saving || !formData.firstName || !formData.phone}
            >
              {saving ? 'שומר...' : 'צור כרטיס'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="סינון מטופלים">
        <div className="space-y-4">
          <div>
            <Label>רמת סיכון</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value as RiskLevel | 'all' }))}
            >
              <option value="all">הכל</option>
              <option value="low">נמוך</option>
              <option value="medium">בינוני</option>
              <option value="high">גבוה</option>
            </select>
          </div>

          <div>
            <Label>תור קרוב</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={filters.hasUpcomingAppointment}
              onChange={(e) => setFilters(prev => ({ ...prev, hasUpcomingAppointment: e.target.value as 'all' | 'yes' | 'no' }))}
            >
              <option value="all">הכל</option>
              <option value="yes">יש תור קרוב</option>
              <option value="no">אין תור קרוב</option>
            </select>
          </div>

          <div>
            <Label>טווח תאריכי ביקור אחרון</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="text-xs text-gray-500">מתאריך</span>
                <Input
                  type="date"
                  value={filters.lastVisitFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastVisitFrom: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-xs text-gray-500">עד תאריך</span>
                <Input
                  type="date"
                  value={filters.lastVisitTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastVisitTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t mt-4">
            <Button
              variant="ghost"
              onClick={() => setFilters(INITIAL_FILTERS)}
              disabled={!hasActiveFilters}
            >
              <X size={16} className="ml-2" /> נקה סינון
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>
              החל סינון ({filteredPatients.length} תוצאות)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Health Declaration Dialog */}
      <Dialog
        open={isHealthDeclarationOpen}
        onClose={() => setIsHealthDeclarationOpen(false)}
        title="שליחת הצהרת בריאות"
      >
        <div className="space-y-4">
          {!generatedToken ? (
            <>
              {/* Form to collect patient info */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p>צור קישור ייחודי להצהרת בריאות ושלח אותו ללקוח באמצעות WhatsApp או אימייל.</p>
              </div>

              <div>
                <Label>שם מלא *</Label>
                <Input
                  placeholder="שם הלקוח"
                  value={healthFormData.patientName}
                  onChange={(e) => setHealthFormData(prev => ({ ...prev, patientName: e.target.value }))}
                />
              </div>

              <div>
                <Label>טלפון נייד *</Label>
                <Input
                  type="tel"
                  placeholder="050-0000000"
                  className="direction-ltr"
                  value={healthFormData.patientPhone}
                  onChange={(e) => setHealthFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                />
              </div>

              <div>
                <Label>אימייל (אופציונלי)</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  className="direction-ltr"
                  value={healthFormData.patientEmail}
                  onChange={(e) => setHealthFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button variant="ghost" onClick={() => setIsHealthDeclarationOpen(false)}>
                  ביטול
                </Button>
                <Button
                  onClick={handleGenerateToken}
                  disabled={creatingToken || !healthFormData.patientName || !healthFormData.patientPhone}
                >
                  {creatingToken ? 'יוצר קישור...' : 'צור קישור'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Token generated - show sharing options */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 mb-1">הקישור נוצר בהצלחה!</h3>
                <p className="text-sm text-green-700">תוקף הקישור: 7 ימים</p>
              </div>

              <div className="space-y-2">
                <Label>קישור להצהרת בריאות</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={generateShareLink(generatedToken.token)}
                    className="bg-gray-50 text-sm font-mono direction-ltr"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {linkCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="mb-3 block">שלח ללקוח</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 gap-2"
                    onClick={handleSendWhatsApp}
                  >
                    <Phone size={18} className="text-green-600" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 gap-2"
                    onClick={handleSendEmail}
                    disabled={!healthFormData.patientEmail}
                  >
                    <Mail size={18} className="text-blue-600" />
                    <span>אימייל</span>
                  </Button>
                </div>
                {!healthFormData.patientEmail && (
                  <p className="text-xs text-gray-500 mt-2 text-center">לא הוזן אימייל - לא ניתן לשלוח במייל</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button variant="ghost" onClick={() => {
                  setGeneratedToken(null);
                  setHealthFormData(INITIAL_HEALTH_FORM);
                }}>
                  צור קישור נוסף
                </Button>
                <Button onClick={() => setIsHealthDeclarationOpen(false)}>
                  סיום
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => !isDeleting && setIsDeleteConfirmOpen(false)}
        title="אישור מחיקה"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="font-bold text-red-800 mb-1">האם אתה בטוח?</h3>
            <p className="text-sm text-red-700">
              פעולה זו תמחק {selectedIds.size} מטופלים לצמיתות.
              <br />
              לא ניתן לבטל פעולה זו.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'מוחק...' : `מחק ${selectedIds.size} מטופלים`}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
