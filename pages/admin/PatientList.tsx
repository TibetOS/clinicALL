import React, { useState } from 'react';
import {
  Search, Filter, UserPlus, ChevronLeft, Download, Calendar as CalendarIcon
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../../components/ui';
import { usePatients } from '../../hooks';
import { useNavigate } from 'react-router-dom';

// Helper for translating status
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'low': 'נמוך',
    'medium': 'בינוני',
    'high': 'גבוה',
  };
  return map[status] || status;
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

export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { patients, loading: patientsLoading, addPatient } = usePatients();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

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
          <p className="text-gray-600">ניהול תיקי לקוחות וטיפולים</p>
        </div>
        <Button className="shadow-sm" onClick={() => setIsAddPatientOpen(true)}>
          <UserPlus className="ml-2 h-4 w-4" /> מטופל חדש
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם או טלפון..."
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1"><Filter className="ml-2 h-3 w-3" /> סינון</Button>
          <Button variant="outline" size="sm" className="flex-1"><Download className="ml-2 h-3 w-3" /> ייצוא</Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden hidden md:block">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-6 py-4">שם המטופל</th>
              <th className="px-6 py-4">טלפון</th>
              <th className="px-6 py-4">ביקור אחרון</th>
              <th className="px-6 py-4">תור קרוב</th>
              <th className="px-6 py-4">רמת סיכון</th>
              <th className="px-6 py-4">סטטוס</th>
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
                className="hover:bg-primary/5 transition-all cursor-pointer group border-r-2 border-r-transparent hover:border-r-primary"
                onClick={() => navigate(`/admin/patients/${patient.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={patient.avatar} className="w-8 h-8 rounded-full bg-gray-200 object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                    <div>
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-xs text-gray-500">{patient.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{patient.phone}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(patient.lastVisit).toLocaleDateString('he-IL')}</td>
                <td className="px-6 py-4">
                  {patient.upcomingAppointment ? (
                    <span className="flex items-center text-primary font-medium">
                      <CalendarIcon size={14} className="ml-1" />
                      {new Date(patient.upcomingAppointment).toLocaleDateString('he-IL')}
                    </span>
                  ) : <span className="text-gray-500">-</span>}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'success'}>
                    {getStatusLabel(patient.riskLevel)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">פעיל</Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon">
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
            className="p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-all touch-manipulation hover:shadow-lg border-r-2 border-r-transparent hover:border-r-primary"
            onClick={() => navigate(`/admin/patients/${patient.id}`)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={patient.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
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
                {new Date(patient.lastVisit).toLocaleDateString('he-IL')}
              </div>
              <div>
                <span className="text-gray-600 block text-xs">תור קרוב</span>
                {patient.upcomingAppointment ? new Date(patient.upcomingAppointment).toLocaleDateString('he-IL') : '-'}
              </div>
            </div>
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
                placeholder="ישראל"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>שם משפחה</Label>
              <Input
                placeholder="ישראלי"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>טלפון נייד</Label>
            <Input
              placeholder="050-0000000"
              className="direction-ltr"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label>אימייל</Label>
            <Input
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
    </div>
  );
};
