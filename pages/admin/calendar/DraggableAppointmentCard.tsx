import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, Eye, Trash2, Phone, Edit2 } from 'lucide-react';
import { Button } from '../../../components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Appointment } from '../../../types';
import { getDeclarationIndicator } from './calendar-helpers';

export type DraggableAppointmentCardProps = {
  appointment: Appointment;
  onCancelRequest: (appointment: Appointment) => void;
  onEditRequest: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
  isDragging?: boolean;
};

export function DraggableAppointmentCard({
  appointment,
  onCancelRequest,
  onEditRequest,
  onViewDetails,
}: DraggableAppointmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: appointment.id,
    data: {
      appointment,
    },
  });

  const declIndicator = getDeclarationIndicator(appointment.declarationStatus);

  const style = {
    top: `${(parseInt(appointment.time.split(':')[1] ?? '0', 10) / 60) * 100}%`,
    height: `${(appointment.duration / 60) * 100}%`,
    minHeight: '40px',
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 20,
  };

  const statusClasses: Record<string, string> = {
    confirmed: 'bg-green-50 border-green-500 text-green-800',
    pending: 'bg-amber-50 border-amber-500 text-amber-800',
    completed: 'bg-blue-50 border-blue-500 text-blue-800',
    cancelled: 'bg-gray-100 border-gray-400 text-gray-700',
    'no-show': 'bg-red-50 border-red-400 text-red-800',
  };

  const statusClass = statusClasses[appointment.status] ?? statusClasses.pending;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          aria-label={`תור: ${appointment.patientName}, ${appointment.serviceName}, ${appointment.time}`}
          className={`absolute left-1 right-1 p-2 rounded-lg text-xs shadow-sm border-l-4 cursor-grab z-20 hover:scale-[1.02] transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${statusClass} ${isDragging ? 'cursor-grabbing shadow-lg ring-2 ring-primary' : ''}`}
          style={style}
          {...attributes}
        >
          <div className="flex items-center gap-1">
            {/* Drag Handle */}
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 -mr-1 rounded hover:bg-black/5 transition-colors"
              aria-label="גרור כדי לשנות זמן"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
            <span className="font-bold truncate flex-1">{appointment.patientName}</span>
            {declIndicator && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${declIndicator.color}`} />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{declIndicator.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="truncate opacity-80 mr-4">{appointment.serviceName}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm">{appointment.patientName}</h4>
              <p className="text-xs text-muted-foreground">{appointment.serviceName}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="אפשרויות נוספות">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => onViewDetails(appointment)}>
                  צפייה בפרטים <Eye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onEditRequest(appointment)}>
                  עריכה <Edit2 className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => {
                    if (appointment.patientId) {
                      window.open(`tel:${appointment.patientId}`, '_blank');
                    }
                  }}
                >
                  התקשר ללקוח <Phone className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600"
                  onClick={() => onCancelRequest(appointment)}
                >
                  ביטול תור <Trash2 className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
            <div>
              <span className="text-muted-foreground block">תאריך</span>
              <span className="font-medium">{new Date(appointment.date).toLocaleDateString('he-IL')}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">שעה</span>
              <span className="font-medium">{appointment.time}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">משך</span>
              <span className="font-medium">{appointment.duration} דק׳</span>
            </div>
            <div>
              <span className="text-muted-foreground block">סטטוס</span>
              <span className={`font-medium ${appointment.status === 'confirmed' ? 'text-green-600' : appointment.status === 'pending' ? 'text-amber-600' : 'text-gray-600'}`}>
                {appointment.status === 'confirmed' ? 'מאושר' : appointment.status === 'pending' ? 'ממתין' : 'בוטל'}
              </span>
            </div>
          </div>
          {appointment.notes && (
            <div className="text-xs border-t pt-2">
              <span className="text-muted-foreground block mb-1">הערות</span>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}
          <div className="text-xs text-gray-400 border-t pt-2 flex items-center gap-1">
            <GripVertical className="h-3 w-3" />
            <span>גרור כדי לשנות זמן</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
