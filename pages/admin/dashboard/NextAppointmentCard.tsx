import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Coffee, Clock, Phone,
  Sparkles, MoreHorizontal, Eye, PhoneCall
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Spinner,
} from '../../../components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Empty } from '../../../components/ui/empty';
import { Appointment, Patient } from '../../../types';

export type NextAppointmentCardProps = {
  isLoading: boolean;
  nextAppointment: (Appointment & { avatar: string }) | undefined;
  patients: Patient[];
};

export function NextAppointmentCard({
  isLoading,
  nextAppointment,
  patients,
}: NextAppointmentCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative card-animate stagger-5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles size={20} className="text-teal-500 animate-gentle-bounce" />
          הטיפול הבא
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : nextAppointment ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-md bg-slate-50">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}
            >
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-md">
                <AvatarImage src={nextAppointment.avatar} alt={nextAppointment.patientName} />
                <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                  {nextAppointment.patientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg bg-teal-500">
                {nextAppointment.time.split(':')[0]}
              </div>
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}
            >
              <p className="font-bold text-lg text-slate-800">{nextAppointment.patientName}</p>
              <p className="text-sm text-slate-600">{nextAppointment.serviceName}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="border-none bg-teal-100 text-teal-700 gap-1">
                  <Clock size={12} /> {nextAppointment.time}
                </Badge>
                <Badge className="border-none bg-slate-100 text-slate-600">
                  {nextAppointment.duration} דק׳
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <MoreHorizontal size={20} className="text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/patients/${nextAppointment.patientId}`)}>
                  <Eye size={16} />
                  צפייה בכרטיס
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => navigate('/admin/calendar')}>
                  <CalendarIcon size={16} />
                  פתח ביומן
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2" onClick={() => {
                  const patient = patients.find(p => p.id === nextAppointment.patientId);
                  if (patient?.phone) window.open(`tel:${patient.phone}`);
                }}>
                  <PhoneCall size={16} />
                  התקשר
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Empty
            icon={<Coffee size={32} className="text-teal-500" />}
            title="אין תורים כרגע"
            description="יום מושלם לפנות ללקוחות ותיקות!"
            action={
              <Button
                variant="outline"
                className="gap-2 border-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                onClick={() => navigate('/admin/patients')}
              >
                <Phone size={16} /> צפייה בלקוחות
              </Button>
            }
            className="py-10 border-none min-h-0"
          />
        )}
      </CardContent>
    </Card>
  );
}
