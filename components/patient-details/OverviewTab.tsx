import { AlertTriangle } from 'lucide-react';
import { Card, Badge } from '../ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Separator } from '../ui/separator';
import { Patient, Appointment } from '../../types';

interface OverviewTabProps {
  patient: Patient;
  appointments: Appointment[];
}

export const OverviewTab = ({ patient, appointments }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            מטרות אסתטיות וטיפולים
          </h3>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">תחומי עניין</h4>
            <div className="flex gap-2 flex-wrap">
              {patient.aestheticInterests?.length ? (
                patient.aestheticInterests.map((interest: string) => (
                  <Badge
                    key={interest}
                    className="bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200"
                  >
                    {interest}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm">לא צוינו תחומי עניין</span>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <h4 className="text-sm font-medium text-gray-500 mb-2">היסטוריית טיפולים</h4>
          {appointments.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-2">
              {appointments.map((apt) => (
                <AccordionItem
                  key={apt.id}
                  value={apt.id}
                  className="border rounded-lg bg-gray-50/50 px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-4 text-right w-full">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-center min-w-[50px] border border-gray-100">
                        <div className="text-xs text-gray-500">
                          {new Date(apt.date).toLocaleDateString('he-IL', {
                            month: 'short',
                          })}
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          {new Date(apt.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{apt.serviceName}</div>
                        <div className="text-sm text-gray-500">
                          {apt.time} • {apt.duration} דק׳
                        </div>
                      </div>
                      <Badge variant={apt.status === 'completed' ? 'success' : 'secondary'}>
                        {apt.status}
                      </Badge>
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
              <span className="font-medium">
                {new Date(patient.memberSince).toLocaleDateString('he-IL')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">מקור הגעה</span>
              <span className="font-medium">{patient.source || 'לא ידוע'}</span>
            </div>
          </div>
        </Card>

        {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
          <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/10">
            <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle size={18} /> התראות רפואיות
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {patient.medicalAlerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Fallback for patients without medicalAlerts field */}
        {(!patient.medicalAlerts || patient.medicalAlerts.length === 0) &&
          patient.riskLevel === 'high' && (
            <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/10">
              <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                <AlertTriangle size={18} /> התראות רפואיות
              </h3>
              <p className="text-sm text-gray-500">
                מטופל מסומן כבעל רמת סיכון גבוהה. יש לבדוק הצהרת בריאות.
              </p>
            </Card>
          )}
      </div>
    </div>
  );
};
