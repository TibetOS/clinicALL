import { useNavigate } from 'react-router-dom';
import { Phone, ChevronLeft, UserCheck } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Badge, Spinner,
} from '../../../components/ui';
import { Empty } from '../../../components/ui/empty';
import { Appointment, Patient } from '../../../types';

export type FollowUpItem = Appointment & {
  patient?: Patient;
};

export type FollowUpListCardProps = {
  isLoading: boolean;
  dueForFollowUp: FollowUpItem[];
  today: Date;
};

export function FollowUpListCard({
  isLoading,
  dueForFollowUp,
  today,
}: FollowUpListCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl border border-slate-100 shadow-sm card-animate stagger-7">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg group">
          <Phone size={20} className="text-slate-400 group-hover:rotate-12 transition-transform duration-200" />
          לקוחות להתקשר אליהן
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : dueForFollowUp.length === 0 ? (
          <Empty
            icon={<UserCheck size={28} className="text-green-600" />}
            title="אין מעקבים ממתינים"
            description="כל הלקוחות מטופלות"
            className="py-8 border-none min-h-0"
          />
        ) : (
          <div className="space-y-3">
            {dueForFollowUp.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-slate-50 group"
                style={{
                  animation: 'fadeInUp 300ms ease-out forwards',
                  animationDelay: `${index * 75}ms`,
                  opacity: 0
                }}
                onClick={() => navigate(`/admin/patients/${item.patientId}`)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&background=CCFBF1&color=0D9488`}
                  alt={item.patientName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-slate-800">{item.patientName}</p>
                  <p className="text-xs text-slate-500">
                    {item.serviceName} • לפני {Math.floor((today.getTime() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24))} ימים
                  </p>
                </div>
                <Badge className="border-none text-xs bg-teal-100 text-teal-700">
                  מעקב בוטוקס
                </Badge>
                <ChevronLeft size={16} className="text-slate-400 group-hover:translate-x-[-4px] transition-transform duration-200" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
