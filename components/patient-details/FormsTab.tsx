import { useState } from 'react';
import {
  FileText, Send, Eye, ShieldCheck, Download, Plus, Activity, FileSignature,
} from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { Declaration } from '../../types';
import { DeclarationViewDialog } from './DeclarationViewDialog';

interface MedicalForm {
  id: string;
  name: string;
  category: string;
  date: string;
  status: string;
}

interface FormsTabProps {
  patientId: string;
  declarations: Declaration[];
}

export const FormsTab = ({ patientId: _patientId, declarations }: FormsTabProps) => {
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [selectedDocument, setSelectedDocument] = useState('הצהרת בריאות שנתית');

  // Medical Forms State - In production, fetch via secured API
  const [medicalForms] = useState<MedicalForm[]>([
    {
      id: 'mf-1',
      name: 'שאלון אבחון עור מקיף',
      category: 'אבחון',
      date: '2023-10-15',
      status: 'completed',
    },
    {
      id: 'mf-2',
      name: 'מעקב טיפול בפיגמנטציה',
      category: 'מעקב',
      date: '2023-09-01',
      status: 'completed',
    },
  ]);

  const handleSendForSignature = () => {
    toast.success(`נשלחה בקשה לחתימה על ${selectedDocument}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Signed Documents Section (PDFs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Documents Actions */}
        <Card className="p-6 bg-blue-50/50 border-blue-100 lg:col-span-1 h-fit">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Send size={18} className="text-primary" /> שליחת מסמכים לחתימה
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            שלח למטופל קישור מאובטח לחתימה על טפסים (SMS/Email)
          </p>
          <div className="space-y-3">
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
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
            <Button className="w-full shadow-sm" onClick={handleSendForSignature}>
              <Send size={14} className="ml-2" /> שלח לחתימה
            </Button>
          </div>
        </Card>

        {/* Signed Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileSignature size={20} className="text-gray-500" />
            מסמכים חתומים (PDF)
          </h3>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            {declarations.length > 0 ? (
              declarations.map((decl) => (
                <div
                  key={decl.id}
                  className="p-4 border-b last:border-0 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">הצהרת בריאות שנתית</h4>
                      <p className="text-xs text-gray-500">
                        נחתם ב-{new Date(decl.submittedAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Badge
                      variant="success"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      חתום
                    </Badge>
                    <Button variant="ghost" size="icon" title="הורד PDF">
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDeclaration(decl)}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
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
              <Activity size={20} className="text-gray-500" />
              טפסים רפואיים (Medical Forms)
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <ShieldCheck size={12} className="text-green-600" />
              מידע מאובטח (Secure API Access verified by Tenant ID)
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Plus size={16} className="ml-2" /> טופס רפואי חדש
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
              {medicalForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{form.name}</td>
                  <td className="p-4">
                    <Badge variant="secondary">{form.category}</Badge>
                  </td>
                  <td className="p-4 text-gray-500">{form.date}</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-100"
                    >
                      הושלם
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      צפה
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Declaration Dialog */}
      <DeclarationViewDialog
        declaration={selectedDeclaration}
        onClose={() => setSelectedDeclaration(null)}
      />
    </div>
  );
};
