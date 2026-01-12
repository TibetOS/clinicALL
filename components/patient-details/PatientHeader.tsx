import { useNavigate } from 'react-router-dom';
import {
  Phone, Plus, MoreHorizontal, Trash2, Edit2,
  Calendar, MessageSquare
} from 'lucide-react';
import { Button, Badge } from '../ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
} from '../ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Patient } from '../../types';

interface PatientHeaderProps {
  patient: Patient;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

export const PatientHeader = ({ patient, isDeleting, onDelete }: PatientHeaderProps) => {
  const navigate = useNavigate();

  const handleCall = () => {
    window.location.href = `tel:${patient.phone}`;
  };

  const handleNewTreatment = () => {
    navigate(`/admin/calendar?patientId=${patient.id}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-4 border-gray-50 shadow-sm">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="text-xl">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white ${
              patient.riskLevel === 'high' ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {patient.name}
            <Badge
              variant="outline"
              className="text-xs font-normal border-purple-200 text-purple-700 bg-purple-50"
            >
              פרופיל אסתטי
            </Badge>
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Phone size={14} /> {patient.phone}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">|</span> {patient.email}
            </div>
            <div className="hidden sm:flex items-center gap-1 text-gray-400">|</div>
            <div>{patient.gender}, גיל {patient.age}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCall}>
          <Phone size={16} className="ml-2" /> התקשר
        </Button>
        <Button variant="primary" className="flex-1 sm:flex-none" onClick={handleNewTreatment}>
          <Plus size={16} className="ml-2" /> טיפול חדש
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <Edit2 className="ml-2 h-4 w-4" />
              עריכת פרופיל
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNewTreatment}>
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
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  מחק מטופל
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>מחיקת מטופל</AlertDialogTitle>
                  <AlertDialogDescription>
                    האם אתה בטוח שברצונך למחוק את {patient.name}?
                    פעולה זו תמחק את כל המידע הקשור למטופל ולא ניתן לבטלה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                    onClick={onDelete}
                  >
                    {isDeleting ? 'מוחק...' : 'מחק'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
