import { UserPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Badge, Skeleton, ComingSoon } from '../../../components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { StaffMember } from '../../../types';

export type TeamTabProps = {
  staff: StaffMember[];
  staffLoading: boolean;
};

export function TeamTab({ staff, staffLoading }: TeamTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">צוות המטפלים</h3>
          <ComingSoon>
            <Button size="sm" className="gap-2">הזמן איש צוות <UserPlus size={14} /></Button>
          </ComingSoon>
        </div>
        <div className="space-y-4">
          {staffLoading ? (
            <>
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>אין עדיין אנשי צוות</p>
              <p className="text-sm mt-1">הזמן את הצוות הראשון שלך</p>
            </div>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">פעיל</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem className="gap-2 opacity-50 cursor-not-allowed" disabled>
                        עריכת פרטים (בקרוב) <Edit2 className="h-4 w-4" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 opacity-50 cursor-not-allowed text-red-600" disabled>
                        הסרה מהצוות (בקרוב) <Trash2 className="h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
