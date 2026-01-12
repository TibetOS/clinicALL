import { FileText, CheckCircle, Send } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Spinner,
} from '../../../components/ui';
import { Empty } from '../../../components/ui/empty';
import { Patient } from '../../../types';

export type DeclarationItem = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  patient?: Patient;
};

export type PendingDeclarationsCardProps = {
  isLoading: boolean;
  patientsNeedingDeclaration: DeclarationItem[];
  sendingDeclaration: string | null;
  onSendDeclaration: (patientId: string, patientName: string, patientPhone?: string) => void;
};

export function PendingDeclarationsCard({
  isLoading,
  patientsNeedingDeclaration,
  sendingDeclaration,
  onSendDeclaration,
}: PendingDeclarationsCardProps) {
  return (
    <Card className="rounded-3xl border border-slate-100 shadow-sm card-animate stagger-6">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText size={20} className="text-slate-400 group-hover:rotate-6 transition-transform duration-200" />
          הצהרות בריאות ממתינות
        </CardTitle>
        {patientsNeedingDeclaration.length > 0 && (
          <Badge className="border-none bg-amber-100 text-amber-700">
            {patientsNeedingDeclaration.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : patientsNeedingDeclaration.length === 0 ? (
          <Empty
            icon={<CheckCircle size={28} className="text-green-600" />}
            title="הכל מסודר!"
            description="כל הלקוחות חתמו על הצהרות"
            className="py-8 border-none min-h-0"
          />
        ) : (
          <div className="space-y-3">
            {patientsNeedingDeclaration.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-slate-50 group"
                style={{
                  animation: 'fadeInUp 300ms ease-out forwards',
                  animationDelay: `${index * 75}ms`,
                  opacity: 0
                }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=CCFBF1&color=0D9488`}
                  alt={item.patientName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-slate-800">{item.patientName}</p>
                  <p className="text-xs text-slate-500">
                    תור: {new Date(item.date).toLocaleDateString('he-IL')} {item.time}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1 shadow-sm bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={sendingDeclaration === item.patientId}
                  onClick={() => onSendDeclaration(item.patientId, item.patientName, item.patient?.phone)}
                >
                  {sendingDeclaration === item.patientId ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Send size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" /> שלח
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
