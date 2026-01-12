import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, UserPlus, Download,
  CheckSquare, MessageSquare, Trash2, FileDown, FileHeart, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, Button, Input, Alert, AlertTitle, AlertDescription } from '../../components/ui';
import { usePatients, useHealthTokens } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Patient, HealthDeclarationToken } from '../../types';

// Extracted components
import { PatientTable } from './patient-list/PatientTable';
import { PatientMobileList } from './patient-list/PatientMobileList';
import { HealthDeclarationDialog } from './patient-list/HealthDeclarationDialog';
import { AddPatientDialog, FilterDialog, DeleteConfirmDialog } from './patient-list/PatientListDialogs';
import {
  PatientFormData,
  FilterState,
  HealthDeclarationFormData,
  INITIAL_PATIENT_FORM,
  INITIAL_FILTERS,
  INITIAL_HEALTH_FORM,
  exportPatientsToCsv,
} from './patient-list/patient-list-helpers';

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
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_PATIENT_FORM);
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
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.phone.includes(debouncedSearch);
      if (!matchesSearch) return false;

      if (filters.riskLevel !== 'all' && p.riskLevel !== filters.riskLevel) return false;

      if (filters.lastVisitFrom && p.lastVisit) {
        if (new Date(p.lastVisit) < new Date(filters.lastVisitFrom)) return false;
      }
      if (filters.lastVisitTo && p.lastVisit) {
        if (new Date(p.lastVisit) > new Date(filters.lastVisitTo)) return false;
      }

      if (filters.hasUpcomingAppointment === 'yes' && !p.upcomingAppointment) return false;
      if (filters.hasUpcomingAppointment === 'no' && p.upcomingAppointment) return false;

      return true;
    });
  }, [patients, debouncedSearch, filters]);

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
    fetchPatients();
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
      setFormData(INITIAL_PATIENT_FORM);
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
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    if (!generatedToken || !healthFormData.patientEmail) return;
    const link = generateEmailLink(generatedToken.token, healthFormData.patientEmail, 'ClinicALL');
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedIds(new Set([patient.id]));
    setIsDeleteConfirmOpen(true);
  };

  const clearFilters = () => setFilters(INITIAL_FILTERS);

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

      {/* Search & Filter Bar */}
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
      <PatientTable
        patients={filteredPatients}
        loading={patientsLoading}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedIds}
        hasActiveFilters={hasActiveFilters}
        onNavigate={(path) => navigate(path)}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelect={toggleSelect}
        onOpenHealthDeclaration={openHealthDeclarationDialog}
        onDeletePatient={handleDeletePatient}
        onClearFilters={clearFilters}
        onAddPatient={() => setIsAddPatientOpen(true)}
      />

      {/* Mobile List */}
      <PatientMobileList
        patients={filteredPatients}
        loading={patientsLoading}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedIds}
        hasActiveFilters={hasActiveFilters}
        onNavigate={(path) => navigate(path)}
        onToggleSelect={toggleSelect}
        onOpenHealthDeclaration={openHealthDeclarationDialog}
        onClearFilters={clearFilters}
        onAddPatient={() => setIsAddPatientOpen(true)}
      />

      {/* Pagination */}
      {!patientsLoading && pagination.totalPages > 1 && (
        <Card className="flex items-center justify-between px-4 py-3">
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
        </Card>
      )}

      {/* Dialogs */}
      <AddPatientDialog
        open={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleAddPatient}
        saving={saving}
      />

      <FilterDialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        resultCount={filteredPatients.length}
      />

      <HealthDeclarationDialog
        open={isHealthDeclarationOpen}
        onClose={() => setIsHealthDeclarationOpen(false)}
        formData={healthFormData}
        onFormChange={setHealthFormData}
        generatedToken={generatedToken}
        linkCopied={linkCopied}
        creatingToken={creatingToken}
        onGenerateToken={handleGenerateToken}
        onCopyLink={handleCopyLink}
        onSendWhatsApp={handleSendWhatsApp}
        onSendEmail={handleSendEmail}
        onCreateAnother={() => {
          setGeneratedToken(null);
          setHealthFormData(INITIAL_HEALTH_FORM);
        }}
        generateShareLink={generateShareLink}
      />

      <DeleteConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteConfirmOpen(open)}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
