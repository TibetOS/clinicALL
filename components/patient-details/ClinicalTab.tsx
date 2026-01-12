import { useState } from 'react';
import { FileText, Save, Plus, ZoomIn } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FaceMap } from '../FaceMap';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { InjectionPoint, ClinicalNote, Patient } from '../../types';

interface ClinicalTabProps {
  patient: Patient;
  clinicalNotes: ClinicalNote[];
  onAddClinicalNote: (note: Omit<ClinicalNote, 'id'>) => Promise<void>;
  onImageClick: (image: string) => void;
}

export const ClinicalTab = ({
  patient,
  clinicalNotes,
  onAddClinicalNote,
  onImageClick,
}: ClinicalTabProps) => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newPoints, setNewPoints] = useState<InjectionPoint[]>([]);
  const [noteText, setNoteText] = useState('');
  const [treatmentArea, setTreatmentArea] = useState('פנים עליונות');
  const [material, setMaterial] = useState('Dysport');

  const handleAddPoint = (point: { x: number; y: number }) => {
    const newPoint: InjectionPoint = {
      id: Math.random().toString(36).substr(2, 9),
      ...point,
      units: 5,
    };
    setNewPoints([...newPoints, newPoint]);
  };

  const handleSaveNote = async () => {
    if (!noteText && newPoints.length === 0) return;

    try {
      await onAddClinicalNote({
        patientId: patient.id,
        date: new Date().toISOString().split('T')[0],
        providerName: profile?.full_name || 'מטפל/ת',
        treatmentType: `${treatmentArea} - ${material}`,
        notes: noteText,
        injectionPoints: newPoints,
        images: [],
      });

      setIsEditing(false);
      setNoteText('');
      setNewPoints([]);
      toast.success('התיעוד נשמר בהצלחה');
    } catch {
      toast.error('שגיאה בשמירת התיעוד');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNoteText('');
    setNewPoints([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in slide-in-from-bottom-2">
      {/* Left: Notes & History */}
      <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
        {/* New Note Entry */}
        <Card
          className={`p-6 transition-all border-primary/20 shadow-md ${
            isEditing ? 'ring-2 ring-primary/20' : ''
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-primary" size={20} /> תיעוד טיפול חדש
            </h3>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('he-IL')}
            </div>
          </div>

          {!isEditing ? (
            <div
              onClick={() => setIsEditing(true)}
              className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors group"
            >
              <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
              <p className="text-gray-500 font-medium group-hover:text-primary transition-colors">
                לחץ כאן כדי להתחיל לתעד הזרקה או טיפול...
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    אזור טיפול
                  </label>
                  <Select value={treatmentArea} onValueChange={setTreatmentArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר אזור" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="פנים עליונות">פנים עליונות</SelectItem>
                      <SelectItem value="פיסול אף">פיסול אף</SelectItem>
                      <SelectItem value="שפתיים">שפתיים</SelectItem>
                      <SelectItem value="קו לסת">קו לסת</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    חומר
                  </label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר חומר" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dysport">Dysport</SelectItem>
                      <SelectItem value="Botox Allergan">Botox Allergan</SelectItem>
                      <SelectItem value="Juvederm Voluma">Juvederm Voluma</SelectItem>
                      <SelectItem value="Restylane">Restylane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                  מהלך הטיפול (טכניקה וכמויות)
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="לדוגמה: הזרקת 1 מ״ל בטכניקת המניפה לאזור הלחיים..."
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-gray-500">
                  {newPoints.length} נקודות הזרקה סומנו על המפה
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleCancelEdit} size="sm">
                    ביטול
                  </Button>
                  <Button size="sm" onClick={handleSaveNote}>
                    <Save size={16} className="ml-2" /> שמור בתיק
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* History List */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            היסטוריית טיפולים
          </h4>
          {clinicalNotes.length > 0 ? (
            clinicalNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-gray-900">{note.treatmentType}</h5>
                    <p className="text-xs text-gray-500">
                      {note.providerName} • {new Date(note.date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <Badge variant="outline">{note.injectionPoints.length} נקודות</Badge>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md mb-3">
                  {note.notes}
                </p>
                {note.images && note.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {note.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group cursor-pointer"
                        onClick={() => onImageClick(img)}
                      >
                        <img
                          src={img}
                          alt={`תמונה קלינית ${i + 1}`}
                          loading="lazy"
                          className="h-16 w-16 rounded-md object-cover border hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-md transition-opacity">
                          <ZoomIn className="text-white w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <FileText size={40} className="mx-auto mb-2 opacity-20" />
              <p>לא נמצאו טיפולים קודמים</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Face Map (Sticky) */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="lg:sticky lg:top-6">
          <Card className="p-4 overflow-hidden bg-gray-50/50">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-gray-900">מפת הזרקות פנים</h3>
              {isEditing && (
                <Badge variant="warning" className="animate-pulse">
                  מצב עריכה - סמן נקודות
                </Badge>
              )}
            </div>

            <FaceMap
              points={isEditing ? newPoints : clinicalNotes[0]?.injectionPoints || []}
              onAddPoint={isEditing ? handleAddPoint : undefined}
              readOnly={!isEditing}
              className="w-full bg-white shadow-inner"
            />

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
              <div className="bg-white p-2 rounded border">
                <span className="block font-bold text-lg text-gray-900">
                  {isEditing
                    ? newPoints.length
                    : clinicalNotes[0]?.injectionPoints.length || 0}
                </span>
                נקודות
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="block font-bold text-lg text-gray-900">
                  {(isEditing
                    ? newPoints.length
                    : clinicalNotes[0]?.injectionPoints.length || 0) * 5}
                  u
                </span>
                כמות משוערת
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
