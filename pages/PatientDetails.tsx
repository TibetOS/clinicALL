import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Sparkles, ImageIcon, Smile, FileSignature } from 'lucide-react';
import { Tabs, Breadcrumb, Alert, AlertTitle, AlertDescription, Spinner } from '../components/ui';
import { usePatients, useAppointments, useClinicalNotes, useDeclarations } from '../hooks';
import { toast } from 'sonner';
import { Patient } from '../types';
import {
  PatientHeader,
  ClinicalTab,
  OverviewTab,
  FormsTab,
  GalleryTab,
  ImageLightbox,
} from './admin/patient-details';

const TAB_CONFIG = [
  { id: 'clinical', label: 'תיק טיפולים', icon: Sparkles },
  { id: 'gallery', label: 'לפני / אחרי', icon: ImageIcon },
  { id: 'overview', label: 'פרופיל אישי', icon: Smile },
  { id: 'forms', label: 'טפסים ומסמכים', icon: FileSignature },
] as const;

type TabId = (typeof TAB_CONFIG)[number]['id'];

export const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('clinical');

  // Data fetching hooks
  const { getPatient, deletePatient } = usePatients();
  const { appointments } = useAppointments({ patientId: id });
  const { declarations } = useDeclarations({ patientId: id });
  const { clinicalNotes, addClinicalNote } = useClinicalNotes({ patientId: id });

  // Patient state
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  // UI state
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Fetch patient on mount
  useEffect(() => {
    if (id) {
      setPatientLoading(true);
      setPatientError(null);
      getPatient(id)
        .then((p) => setPatient(p))
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'שגיאה בטעינת המטופל';
          setPatientError(message);
        })
        .finally(() => setPatientLoading(false));
    }
  }, [id, getPatient]);

  const handleDeletePatient = async () => {
    if (!patient) return;

    setIsDeleting(true);
    const success = await deletePatient(patient.id);
    setIsDeleting(false);

    if (success) {
      toast.success('המטופל נמחק בהצלחה');
      navigate('/admin/patients');
    } else {
      toast.error('שגיאה במחיקת המטופל');
    }
  };

  // Loading state
  if (patientLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <span className="text-gray-500">טוען פרטי מטופל...</span>
      </div>
    );
  }

  // Error state
  if (patientError) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת מטופל</AlertTitle>
          <AlertDescription>{patientError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found state
  if (!patient) {
    return <div className="p-8">מטופל לא נמצא</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[{ label: 'מטופלים', href: '/admin/patients' }, { label: patient.name }]}
      />

      {/* Header Card */}
      <PatientHeader
        patient={patient}
        isDeleting={isDeleting}
        onDelete={handleDeletePatient}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabId)}>
        <div className="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-8 space-x-reverse min-w-max px-1" aria-label="Tabs">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`ml-2 ${
                      activeTab === tab.id
                        ? 'text-primary'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab patient={patient} appointments={appointments} />
          )}

          {activeTab === 'clinical' && (
            <ClinicalTab
              patient={patient}
              clinicalNotes={clinicalNotes}
              onAddClinicalNote={addClinicalNote}
              onImageClick={setLightboxImage}
            />
          )}

          {activeTab === 'forms' && (
            <FormsTab patientId={patient.id} declarations={declarations} />
          )}

          {activeTab === 'gallery' && <GalleryTab onImageClick={setLightboxImage} />}
        </div>
      </Tabs>

      {/* Lightbox Modal */}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
