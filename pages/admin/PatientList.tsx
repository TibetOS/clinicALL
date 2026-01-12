import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, UserPlus, Download,
  X, CheckSquare, Square, MessageSquare, Trash2, FileDown, FileHeart, Copy,
  Check, Send, Mail, Phone, Clock, AlertCircle, FileCheck, MoreHorizontal,
  Eye, Calendar, Users, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  Card, Button, Input, Badge, Dialog, Label, Skeleton,
  Alert, AlertTitle, AlertDescription,
} from '../../components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Empty } from '../../components/ui/empty';
import { usePatients, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Patient, RiskLevel, HealthDeclarationToken, DeclarationStatus } from '../../types';
import { getRiskLevelLabel, getRiskLevelVariant } from '../../lib/status-helpers';
import { exportToCSV } from '../../lib/csv-export';

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

// Patient CSV export helper
const exportPatientsToCsv = (patients: Patient[], filename: string) => {
  const headers = ['שם', 'טלפון', 'אימייל', 'ביקור אחרון', 'תור קרוב', 'רמת סיכון', 'תאריך הצטרפות'];
  const rows = patients.map(p => [
    p.name,
    p.phone,
    p.email,
    p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('he-IL') : '',
    p.upcomingAppointment ? new Date(p.upcomingAppointment).toLocaleDateString('he-IL') : '',
    getRiskLevelLabel(p.riskLevel),
    p.memberSince ? new Date(p.memberSince).toLocaleDateString('he-IL') : '',
  ]);
  exportToCSV(headers, rows, { filename });
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { patients, loading: patientsLoading, error, pagination, setPage, addPatient, updatePatient, deletePatient, fetchPatients } = usePatients();

  // Debounce search to prevent excessive filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const { createToken, generateShareLink, generateWhatsAppLink, generateEmailLink } = useHealthTokens();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [saving, setSaving] = useState(false);

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
      // Text search (using debounced value for performance)
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.phone.includes(debouncedSearch);
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
  }, [patients, debouncedSearch, filters]);

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
    const idsArray = Array.from(selectedIds);

    // Use Promise.allSettled for better error handling
    const results = await Promise.allSettled(
      idsArray.map(id => deletePatient(id))
    );

    const failures = results.filter(r => r.status === 'rejected');
    const successCount = results.length - failures.length;

    if (failures.length > 0) {
      toast.error(`נמחקו ${successCount} מטופלים, ${failures.length} נכשלו`);
    } else {
      toast.success(`${successCount} מטופלים נמחקו בהצלחה`);
    }

    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setIsDeleteConfirmOpen(false);
    setIsDeleting(false);
    fetchPatients(); // Refresh the list
  };

  const handleExportSelected = () => {
    const selectedPatients = filteredPatients.filter(p => selectedIds.has(p.id));
    exportPatientsToCsv(selectedPatients, 'patients_selected');
    toast.success(`${selectedPatients.length} מטופלים יוצאו ל-CSV`);
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
      toast.success('המטופל נוסף בהצלחה');
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

      // Update patient's declaration status to 'pending' if this is for an existing patient
      if (healthFormData.patientId) {
        await updatePatient(healthFormData.patientId, {
          declarationStatus: 'pending',
          pendingDeclarationToken: token.token,
        });
      }
    }
  };

  const handleCopyLink = async () => {
    if (!generatedToken) return;
    const link = generateShareLink(generatedToken.token);
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success('הקישור הועתק');
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
    <div className="space-y-6 pb-10 page-transition">
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
            className="gap-2"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds(new Set());
            }}
          >
            {isSelectionMode ? 'בטל בחירה' : 'בחירה מרובה'} <CheckSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => openHealthDeclarationDialog()}>
            הצהרת בריאות <FileHeart className="h-4 w-4" />
          </Button>
          <Button className="shadow-sm gap-2" onClick={() => setIsAddPatientOpen(true)}>
            מטופל חדש <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת מטופלים</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => fetchPatients()}>
              נסה שוב
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Mode Actions Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <span className="font-medium text-primary">
            {selectedIds.size} מטופלים נבחרו
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportSelected}>
              ייצוא ל-CSV <FileDown size={16} />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              שלח SMS <MessageSquare size={16} />
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setIsDeleteConfirmOpen(true)}>
              מחק <Trash2 size={16} />
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
            className="flex-1 relative gap-1.5"
            onClick={() => setIsFilterOpen(true)}
          >
            סינון <Filter className="h-3 w-3" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => {
              exportPatientsToCsv(filteredPatients, 'patients');
              toast.success('הקובץ הורד בהצלחה');
            }}
          >
            ייצוא <Download className="h-3 w-3" />
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
            {/* Empty state */}
            {!patientsLoading && filteredPatients.length === 0 && (
              <tr>
                <td colSpan={isSelectionMode ? 7 : 6} className="py-12">
                  <Empty
                    icon={hasActiveFilters ? <Search className="h-6 w-6 text-muted-foreground" /> : <Users className="h-6 w-6 text-muted-foreground" />}
                    title={hasActiveFilters ? 'לא נמצאו תוצאות' : 'אין מטופלים'}
                    description={hasActiveFilters ? 'נסה לשנות את מסנני החיפוש' : 'הוסף מטופל חדש כדי להתחיל'}
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" className="gap-2" onClick={() => setFilters(INITIAL_FILTERS)}>
                          נקה סינון <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="gap-2" onClick={() => setIsAddPatientOpen(true)}>
                          הוסף מטופל <UserPlus className="h-4 w-4" />
                        </Button>
                      )
                    }
                  />
                </td>
              </tr>
            )}
            {!patientsLoading && filteredPatients.length > 0 && filteredPatients.map(patient => (
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
                    <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
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
                            className="h-7 px-2 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHealthDeclarationDialog(patient);
                            }}
                          >
                            שלח <Send size={12} />
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getRiskLevelVariant(patient.riskLevel)}>
                    {getRiskLevelLabel(patient.riskLevel)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="פעולות" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/patients/${patient.id}`)}>
                        צפייה בפרופיל <Eye className="h-4 w-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/patients/${patient.id}?tab=appointments`)}>
                        קביעת תור <Calendar className="h-4 w-4" />
                      </DropdownMenuItem>
                      {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
                        <DropdownMenuItem className="gap-2" onClick={() => openHealthDeclarationDialog(patient)}>
                          שלח הצהרת בריאות <FileHeart className="h-4 w-4" />
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 gap-2"
                        onClick={() => {
                          setSelectedIds(new Set([patient.id]));
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        מחיקה <Trash2 className="h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        {/* Mobile Empty state */}
        {!patientsLoading && filteredPatients.length === 0 && (
          <Card className="p-8">
            <Empty
              icon={hasActiveFilters ? <Search className="h-6 w-6 text-muted-foreground" /> : <Users className="h-6 w-6 text-muted-foreground" />}
              title={hasActiveFilters ? 'לא נמצאו תוצאות' : 'אין מטופלים'}
              description={hasActiveFilters ? 'נסה לשנות את מסנני החיפוש' : 'הוסף מטופל חדש כדי להתחיל'}
              action={
                hasActiveFilters ? (
                  <Button variant="outline" className="gap-2" onClick={() => setFilters(INITIAL_FILTERS)}>
                    נקה סינון <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="gap-2" onClick={() => setIsAddPatientOpen(true)}>
                    הוסף מטופל <UserPlus className="h-4 w-4" />
                  </Button>
                )
              }
            />
          </Card>
        )}
        {!patientsLoading && filteredPatients.length > 0 && filteredPatients.map(patient => (
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
                <Avatar className="w-12 h-12">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-600">{patient.phone}</div>
                </div>
              </div>
              <Badge variant={getRiskLevelVariant(patient.riskLevel)}>
                {getRiskLevelLabel(patient.riskLevel)}
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
                className="w-full mt-2 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openHealthDeclarationDialog(patient);
                }}
              >
                שלח הצהרת בריאות <Send size={14} />
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {!patientsLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-xl">
          <div className="text-sm text-gray-600">
            עמוד {pagination.page} מתוך {pagination.totalPages} ({pagination.totalCount} מטופלים)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="gap-1"
            >
              <ChevronRight size={16} />
              הקודם
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="gap-1"
            >
              הבא
              <ChevronLeft size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} title="הוספת מטופל חדש">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-first-name">שם פרטי</Label>
              <Input
                id="patient-first-name"
                name="given-name"
                autoComplete="given-name"
                placeholder="ישראל"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="patient-last-name">שם משפחה</Label>
              <Input
                id="patient-last-name"
                name="family-name"
                autoComplete="family-name"
                placeholder="ישראלי"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="patient-phone">טלפון נייד</Label>
            <Input
              id="patient-phone"
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
            <Label htmlFor="patient-email">אימייל</Label>
            <Input
              id="patient-email"
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
              <Label htmlFor="patient-birthdate">תאריך לידה</Label>
              <Input
                id="patient-birthdate"
                type="date"
                name="bday"
                autoComplete="bday"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="patient-gender">מגדר</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מגדר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="נקבה">נקבה</SelectItem>
                  <SelectItem value="זכר">זכר</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
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
            <Label htmlFor="filter-risk-level">רמת סיכון</Label>
            <Select
              value={filters.riskLevel}
              onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value as RiskLevel | 'all' }))}
            >
              <SelectTrigger id="filter-risk-level">
                <SelectValue placeholder="בחר רמת סיכון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="low">נמוך</SelectItem>
                <SelectItem value="medium">בינוני</SelectItem>
                <SelectItem value="high">גבוה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-upcoming-appointment">תור קרוב</Label>
            <Select
              value={filters.hasUpcomingAppointment}
              onValueChange={(value) => setFilters(prev => ({ ...prev, hasUpcomingAppointment: value as 'all' | 'yes' | 'no' }))}
            >
              <SelectTrigger id="filter-upcoming-appointment">
                <SelectValue placeholder="בחר סטטוס תור" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="yes">יש תור קרוב</SelectItem>
                <SelectItem value="no">אין תור קרוב</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>טווח תאריכי ביקור אחרון</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="filter-visit-from" className="text-xs text-gray-500 font-normal">מתאריך</Label>
                <Input
                  id="filter-visit-from"
                  type="date"
                  value={filters.lastVisitFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastVisitFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="filter-visit-to" className="text-xs text-gray-500 font-normal">עד תאריך</Label>
                <Input
                  id="filter-visit-to"
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
              className="gap-2"
              onClick={() => setFilters(INITIAL_FILTERS)}
              disabled={!hasActiveFilters}
            >
              נקה סינון <X size={16} />
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
                <Label htmlFor="health-patient-name">שם מלא *</Label>
                <Input
                  id="health-patient-name"
                  placeholder="שם הלקוח"
                  value={healthFormData.patientName}
                  onChange={(e) => setHealthFormData(prev => ({ ...prev, patientName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="health-patient-phone">טלפון נייד *</Label>
                <Input
                  id="health-patient-phone"
                  type="tel"
                  placeholder="050-0000000"
                  className="direction-ltr"
                  value={healthFormData.patientPhone}
                  onChange={(e) => setHealthFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="health-patient-email">אימייל (אופציונלי)</Label>
                <Input
                  id="health-patient-email"
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={(open) => !isDeleting && setIsDeleteConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              פעולה זו תמחק {selectedIds.size} מטופלים לצמיתות.
              <br />
              לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'מוחק...' : `מחק ${selectedIds.size} מטופלים`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
