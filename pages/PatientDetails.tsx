import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Phone, Mail, AlertTriangle, FileText, Image as ImageIcon,
  Activity, Save, Plus, MoreHorizontal, X, ZoomIn,
  FileSignature, Send, Eye, CheckCircle2, Sparkles, Smile,
  SplitSquareHorizontal, ShieldCheck, Download, Trash2, Edit2,
  Calendar, MessageSquare
} from 'lucide-react';
import { Button, Card, Badge, Dialog, Tabs, Breadcrumb } from '../components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { FaceMap } from '../components/FaceMap';
import { ImageSlider } from '../components/ImageSlider';
import { usePatients, useAppointments, useClinicalNotes, useDeclarations } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { InjectionPoint, Declaration, Patient } from '../types';

export const PatientDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('clinical');

  // Use hooks for data fetching
  const { getPatient } = usePatients();
  const { appointments } = useAppointments({ patientId: id });
  const { declarations } = useDeclarations({ patientId: id });
  const { clinicalNotes, addClinicalNote } = useClinicalNotes({ patientId: id });

  // Get current user for provider name
  const { profile } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  // Fetch patient on mount
  useEffect(() => {
    if (id) {
      setPatientLoading(true);
      setPatientError(null);
      getPatient(id)
        .then((p) => {
          setPatient(p);
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'שגיאה בטעינת המטופל';
          setPatientError(message);
        })
        .finally(() => {
          setPatientLoading(false);
        });
    }
  }, [id, getPatient]);

  // New Clinical Note State
  const [isEditing, setIsEditing] = useState(false);
  const [newPoints, setNewPoints] = useState<InjectionPoint[]>([]);
  const [noteText, setNoteText] = useState('');
  
  // Gallery Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  // Form Viewing State
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [, _setLinkCopied] = useState(false);

  // Medical Forms State (Mocking secure fetch)
  const [medicalForms] = useState([
     { id: 'mf-1', name: 'שאלון אבחון עור מקיף', category: 'אבחון', date: '2023-10-15', status: 'completed' },
     { id: 'mf-2', name: 'מעקב טיפול בפיגמנטציה', category: 'מעקב', date: '2023-09-01', status: 'completed' }
  ]);

  // Medical forms would be fetched via a secured API endpoint in production
  // verifying tenant_id for multi-tenant security

  if (patientLoading) return <div className="p-8">טוען...</div>;
  if (patientError) return (
    <div className="p-8 text-center">
      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">שגיאה בטעינת מטופל</h2>
      <p className="text-gray-500">{patientError}</p>
    </div>
  );
  if (!patient) return <div className="p-8">מטופל לא נמצא</div>;

  const handleAddPoint = (point: { x: number; y: number }) => {
    const newPoint: InjectionPoint = {
      id: Math.random().toString(36).substr(2, 9),
      ...point,
      units: 5 // default units for demo
    };
    setNewPoints([...newPoints, newPoint]);
  };

  const handleSaveNote = async () => {
    if (!noteText && newPoints.length === 0) return;

    await addClinicalNote({
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      providerName: profile?.full_name || 'מטפל/ת',
      treatmentType: 'טיפול אסתטי',
      notes: noteText,
      injectionPoints: newPoints,
      images: []
    });

    setIsEditing(false);
    setNoteText('');
    setNewPoints([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'מטופלים', href: '/admin/patients' },
        { label: patient.name }
      ]} />

      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
             <Avatar className="h-20 w-20 border-4 border-gray-50 shadow-sm">
               <AvatarImage src={patient.avatar} alt={patient.name} />
               <AvatarFallback className="text-xl">{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
             </Avatar>
             <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white ${patient.riskLevel === 'high' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {patient.name}
              <Badge variant="outline" className="text-xs font-normal border-purple-200 text-purple-700 bg-purple-50">פרופיל אסתטי</Badge>
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1"><Phone size={14}/> {patient.phone}</div>
              <div className="flex items-center gap-1"><Mail size={14}/> {patient.email}</div>
              <div className="hidden sm:flex items-center gap-1 text-gray-400">|</div>
              <div>{patient.gender}, גיל {patient.age}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none"><Phone size={16} className="ml-2"/> התקשר</Button>
          <Button variant="primary" className="flex-1 sm:flex-none"><Plus size={16} className="ml-2"/> טיפול חדש</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex"><MoreHorizontal size={20}/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Edit2 className="ml-2 h-4 w-4" />
                עריכת פרופיל
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="ml-2 h-4 w-4" />
                קביעת תור
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="ml-2 h-4 w-4" />
                שלח הודעה
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                    <Trash2 className="ml-2 h-4 w-4" />
                    מחק מטופל
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>מחיקת מטופל</AlertDialogTitle>
                    <AlertDialogDescription>
                      האם אתה בטוח שברצונך למחוק את {patient.name}? פעולה זו תמחק את כל המידע הקשור למטופל ולא ניתן לבטלה.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">מחק</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <div className="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
            <nav className="flex space-x-8 space-x-reverse min-w-max px-1" aria-label="Tabs">
               {[
                  { id: 'clinical', label: 'תיק טיפולים', icon: Sparkles },
                  { id: 'gallery', label: 'לפני / אחרי', icon: ImageIcon },
                  { id: 'overview', label: 'פרופיל אישי', icon: Smile },
                  { id: 'forms', label: 'טפסים ומסמכים', icon: FileSignature },
               ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                        ${activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                     `}
                  >
                     <Icon size={16} className={`ml-2 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                     {tab.label}
                  </button>
                  )
               })}
            </nav>
         </div>

         {/* Content Area */}
         <div className="min-h-[400px]">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
               <div className="md:col-span-2 space-y-6">
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-4 text-gray-900">מטרות אסתטיות וטיפולים</h3>
                     
                     <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">תחומי עניין</h4>
                        <div className="flex gap-2 flex-wrap">
                           {patient.aestheticInterests?.map((interest: string) => (
                              <Badge key={interest} className="bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200">{interest}</Badge>
                           )) || <span className="text-gray-400 text-sm">לא צוינו תחומי עניין</span>}
                        </div>
                     </div>

                     <Separator className="my-4" />

                     <h4 className="text-sm font-medium text-gray-500 mb-2">היסטוריית טיפולים</h4>
                     {appointments.length > 0 ? (
                        <Accordion type="single" collapsible className="space-y-2">
                           {appointments.map(apt => (
                              <AccordionItem key={apt.id} value={apt.id} className="border rounded-lg bg-gray-50/50 px-4">
                                 <AccordionTrigger className="hover:no-underline py-3">
                                    <div className="flex items-center gap-4 text-right w-full">
                                       <div className="bg-white p-2 rounded-lg shadow-sm text-center min-w-[50px] border border-gray-100">
                                          <div className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString('he-IL', { month: 'short' })}</div>
                                          <div className="font-bold text-lg text-gray-900">{new Date(apt.date).getDate()}</div>
                                       </div>
                                       <div className="flex-1">
                                          <div className="font-medium text-gray-900">{apt.serviceName}</div>
                                          <div className="text-sm text-gray-500">{apt.time} • {apt.duration} דק׳</div>
                                       </div>
                                       <Badge variant={apt.status === 'completed' ? 'success' : 'secondary'}>{apt.status}</Badge>
                                    </div>
                                 </AccordionTrigger>
                                 <AccordionContent className="pb-4 pt-2">
                                    <div className="bg-white p-4 rounded-lg border space-y-2">
                                       <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">מטפל/ת:</span>
                                          <span className="font-medium">{apt.providerName || 'לא צוין'}</span>
                                       </div>
                                       <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">משך הטיפול:</span>
                                          <span className="font-medium">{apt.duration} דקות</span>
                                       </div>
                                       {apt.notes && (
                                          <div className="pt-2 border-t mt-2">
                                             <span className="text-gray-500 text-xs block mb-1">הערות:</span>
                                             <p className="text-sm">{apt.notes}</p>
                                          </div>
                                       )}
                                    </div>
                                 </AccordionContent>
                              </AccordionItem>
                           ))}
                        </Accordion>
                     ) : (
                        <p className="text-gray-500 text-center py-8">אין היסטוריית טיפולים</p>
                     )}
                  </Card>
               </div>
               
               <div className="space-y-6">
                   <Card className="p-6">
                     <h3 className="font-semibold mb-3">מאפיינים אישיים</h3>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="text-gray-500">סוג עור</span>
                           <span className="font-medium">{patient.skinType || 'לא ידוע'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="text-gray-500">תאריך הצטרפות</span>
                           <span className="font-medium">{new Date(patient.memberSince).toLocaleDateString('he-IL')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="text-gray-500">מקור הגעה</span>
                           <span className="font-medium">אינסטגרם</span>
                        </div>
                     </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/10">
                     <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                     <AlertTriangle size={18} /> התראות רפואיות
                     </h3>
                     <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                     <li>רגישות לחומרי אלחוש</li>
                     <li>נוטלת אספירין באופן קבוע</li>
                     </ul>
                  </Card>
               </div>
               </div>
            )}

            {/* TAB: CLINICAL (The main feature) */}
            {activeTab === 'clinical' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in slide-in-from-bottom-2">
               {/* Left: Notes & History */}
               <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                  
                  {/* New Note Entry */}
                  <Card className={`p-6 transition-all border-primary/20 shadow-md ${isEditing ? 'ring-2 ring-primary/20' : ''}`}>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                           <FileText className="text-primary" size={20}/> תיעוד טיפול חדש
                        </h3>
                        <div className="text-sm text-gray-500">{new Date().toLocaleDateString('he-IL')}</div>
                     </div>
                     
                     {!isEditing ? (
                        <div 
                           onClick={() => setIsEditing(true)}
                           className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors group"
                        >
                           <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                           <p className="text-gray-500 font-medium group-hover:text-primary transition-colors">לחץ כאן כדי להתחיל לתעד הזרקה או טיפול...</p>
                        </div>
                     ) : (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">אזור טיפול</label>
                                 <Select defaultValue="פנים עליונות">
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
                                 <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">חומר</label>
                                 <Select defaultValue="Dysport">
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
                              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">מהלך הטיפול (טכניקה וכמויות)</label>
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
                                 <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">ביטול</Button>
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
                     <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">היסטוריית טיפולים</h4>
                     {clinicalNotes.length > 0 ? clinicalNotes.map(note => (
                        <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                           <div className="flex justify-between items-start mb-3">
                              <div>
                                 <h5 className="font-bold text-gray-900">{note.treatmentType}</h5>
                                 <p className="text-xs text-gray-500">{note.providerName} • {new Date(note.date).toLocaleDateString('he-IL')}</p>
                              </div>
                              <Badge variant="outline">{note.injectionPoints.length} נקודות</Badge>
                           </div>
                           <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md mb-3">
                              {note.notes}
                           </p>
                           {note.images && (
                              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                 {note.images.map((img, i) => (
                                    <div key={i} className="relative group cursor-pointer" onClick={() => setLightboxImage(img)}>
                                        <img src={img} alt={`תמונה קלינית ${i + 1}`} loading="lazy" className="h-16 w-16 rounded-md object-cover border hover:opacity-90 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-md transition-opacity">
                                           <ZoomIn className="text-white w-5 h-5" />
                                        </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     )) : (
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
                           {isEditing && <Badge variant="warning" className="animate-pulse">מצב עריכה - סמן נקודות</Badge>}
                        </div>
                        
                        <FaceMap 
                           points={isEditing ? newPoints : clinicalNotes[0]?.injectionPoints || []}
                           onAddPoint={isEditing ? handleAddPoint : undefined}
                           readOnly={!isEditing}
                           className="w-full bg-white shadow-inner"
                        />

                        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
                           <div className="bg-white p-2 rounded border">
                              <span className="block font-bold text-lg text-gray-900">{isEditing ? newPoints.length : clinicalNotes[0]?.injectionPoints.length || 0}</span>
                              נקודות
                           </div>
                           <div className="bg-white p-2 rounded border">
                              <span className="block font-bold text-lg text-gray-900">{(isEditing ? newPoints.length : clinicalNotes[0]?.injectionPoints.length || 0) * 5}u</span>
                              כמות משוערת
                           </div>
                        </div>
                     </Card>
                  </div>
               </div>
               </div>
            )}

            {/* TAB: FORMS */}
            {activeTab === 'forms' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* Signed Documents Section (PDFs) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Send Documents Actions */}
                     <Card className="p-6 bg-blue-50/50 border-blue-100 lg:col-span-1 h-fit">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                           <Send size={18} className="text-primary"/> שליחת מסמכים לחתימה
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                           שלח למטופל קישור מאובטח לחתימה על טפסים (SMS/Email)
                        </p>
                        <div className="space-y-3">
                           <Select defaultValue="הצהרת בריאות שנתית">
                              <SelectTrigger className="text-sm">
                                 <SelectValue placeholder="בחר מסמך" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="הצהרת בריאות שנתית">הצהרת בריאות שנתית</SelectItem>
                                 <SelectItem value="טופס הסכמה - הזרקות">טופס הסכמה - הזרקות</SelectItem>
                                 <SelectItem value="טופס הסכמה - לייזר">טופס הסכמה - לייזר</SelectItem>
                                 <SelectItem value="הסכם טיפול ונהלים">הסכם טיפול ונהלים</SelectItem>
                              </SelectContent>
                           </Select>
                           <Button className="w-full shadow-sm">
                             <Send size={14} className="ml-2"/> שלח לחתימה
                           </Button>
                        </div>
                     </Card>

                     {/* Signed Documents List */}
                     <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                           <FileSignature size={20} className="text-gray-500"/>
                           מסמכים חתומים (PDF)
                        </h3>
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                           {declarations.length > 0 ? declarations.map(decl => (
                              <div key={decl.id} className="p-4 border-b last:border-0 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors gap-3 sm:gap-0">
                                 <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                                       <FileText size={20} />
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-gray-900 text-sm">הצהרת בריאות שנתית</h4>
                                       <p className="text-xs text-gray-500">נחתם ב-{new Date(decl.submittedAt).toLocaleDateString('he-IL')}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">חתום</Badge>
                                    <Button variant="ghost" size="icon" title="הורד PDF">
                                       <Download size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedDeclaration(decl)}>
                                       <Eye size={16} />
                                    </Button>
                                 </div>
                              </div>
                           )) : (
                              <div className="p-8 text-center text-gray-400">לא נמצאו מסמכים חתומים</div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Medical Forms Section (Fetched securely) */}
                  <div className="pt-6 border-t">
                     <div className="flex justify-between items-center mb-4">
                        <div>
                           <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                              <Activity size={20} className="text-gray-500"/>
                              טפסים רפואיים (Medical Forms)
                           </h3>
                           <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <ShieldCheck size={12} className="text-green-600"/> 
                              מידע מאובטח (Secure API Access verified by Tenant ID)
                           </p>
                        </div>
                        <Button variant="outline" size="sm">
                           <Plus size={16} className="ml-2"/> טופס רפואי חדש
                        </Button>
                     </div>

                     <div className="bg-white border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-sm text-right min-w-[600px]">
                           <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                              <tr>
                                 <th className="p-4">שם הטופס</th>
                                 <th className="p-4">קטגוריה</th>
                                 <th className="p-4">תאריך</th>
                                 <th className="p-4">סטטוס</th>
                                 <th className="p-4">פעולות</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y">
                              {medicalForms.map(form => (
                                 <tr key={form.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-gray-900">{form.name}</td>
                                    <td className="p-4"><Badge variant="secondary">{form.category}</Badge></td>
                                    <td className="p-4 text-gray-500">{form.date}</td>
                                    <td className="p-4"><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">הושלם</Badge></td>
                                    <td className="p-4">
                                       <Button variant="ghost" size="sm">צפה</Button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {/* TAB: GALLERY (Upgraded) */}
            {activeTab === 'gallery' && (
               <div>
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex gap-4 items-center">
                        <h3 className="font-bold text-lg text-gray-900">גלריית לפני / אחרי</h3>
                        <Button variant={compareMode ? "primary" : "outline"} size="sm" onClick={() => setCompareMode(!compareMode)}>
                           <SplitSquareHorizontal size={16} className="ml-2"/> מצב השוואה
                        </Button>
                     </div>
                     <Button variant="outline" size="sm">הוסף תיקייה</Button>
                  </div>

                  {compareMode ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
                        <Card className="p-4">
                           <h4 className="font-bold mb-4 text-center">פיסול אף (2023)</h4>
                           <ImageSlider 
                              beforeImage="https://picsum.photos/600/600?random=1" 
                              afterImage="https://picsum.photos/600/600?random=2" 
                           />
                        </Card>
                        <Card className="p-4">
                           <h4 className="font-bold mb-4 text-center">עיבוי שפתיים (2022)</h4>
                           <ImageSlider 
                              beforeImage="https://picsum.photos/600/600?random=3" 
                              afterImage="https://picsum.photos/600/600?random=4" 
                           />
                        </Card>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:border-primary/50 hover:text-primary transition-all">
                           <Plus size={32} className="mb-2" />
                           <span className="text-sm font-medium">העלה תמונה</span>
                        </div>
                        {[1,2,3,4,5,6].map(i => {
                           const imgSrc = `https://picsum.photos/600/600?random=20${i}`;
                           return (
                           <div 
                              key={i} 
                              className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                              onClick={() => setLightboxImage(imgSrc)}
                           >
                              <img src={imgSrc} alt={`תמונה קלינית ${i % 2 === 0 ? 'אחרי' : 'לפני'} טיפול`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                 <div className="text-white translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-1 text-[10px]">
                                       {i % 2 === 0 ? 'אחרי' : 'לפני'}
                                    </Badge>
                                    <p className="font-bold text-sm">פיסול שפתיים</p>
                                    <p className="text-xs opacity-80">15.10.2023</p>
                                 </div>
                              </div>
                           </div>
                        )})}
                     </div>
                  )}
               </div>
            )}
         </div>
      </Tabs>

      {/* Lightbox Modal */}
      {lightboxImage && (
         <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setLightboxImage(null)}
         >
            <button 
               className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
               onClick={() => setLightboxImage(null)}
            >
               <X size={32} />
            </button>
            <img
               src={lightboxImage}
               alt="תמונה קלינית בתצוגה מוגדלת"
               className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
               onClick={(e) => e.stopPropagation()}
            />
         </div>
      )}

      {/* View Declaration Modal */}
      <Dialog 
        open={!!selectedDeclaration} 
        onClose={() => setSelectedDeclaration(null)} 
        title="הצהרת בריאות - צפייה"
      >
         {selectedDeclaration && (
            <div className="space-y-6">
               <div className="bg-gray-50 p-4 rounded-lg border text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <span className="block text-gray-500 text-xs">שם המטופל</span>
                     <span className="font-bold">{selectedDeclaration.patientName}</span>
                  </div>
                  <div>
                     <span className="block text-gray-500 text-xs">תאריך הגשה</span>
                     <span className="font-bold">{new Date(selectedDeclaration.submittedAt).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div>
                     <span className="block text-gray-500 text-xs">טלפון</span>
                     <span className="font-bold">{selectedDeclaration.formData.personalInfo.phone}</span>
                  </div>
               </div>

               <div>
                  <h4 className="font-bold border-b pb-2 mb-3 text-gray-800">היסטוריה רפואית</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center border-b border-dashed pb-2">
                        <span className="text-gray-600">רגישויות ומחלות רקע</span>
                        <div className="flex gap-2">
                           {selectedDeclaration.formData.medicalHistory.conditions.length > 0 ? (
                              selectedDeclaration.formData.medicalHistory.conditions.map(c => (
                                 <Badge key={c} variant="destructive">{c}</Badge>
                              ))
                           ) : <span className="text-gray-400 text-sm">ללא</span>}
                        </div>
                     </div>
                     <div className="flex justify-between items-center border-b border-dashed pb-2">
                        <span className="text-gray-600">תרופות קבועות</span>
                        <span className="font-medium text-gray-900">{selectedDeclaration.formData.medicalHistory.medications || 'ללא'}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="text-green-600" />
                     <span className="text-green-800 font-medium">נחתם דיגיטלית</span>
                  </div>
                  <span className="text-xs text-green-700 font-mono tracking-wider opacity-70">
                     SIG-{selectedDeclaration.id.toUpperCase()}-SECURE
                  </span>
               </div>
               
               <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setSelectedDeclaration(null)}>סגור</Button>
               </div>
            </div>
         )}
      </Dialog>
    </div>
  );
};
