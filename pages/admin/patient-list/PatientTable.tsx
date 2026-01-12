import React from 'react';
import {
  Search, CheckSquare, Square, Trash2, FileHeart, MoreHorizontal,
  Eye, Calendar, Send, Users, UserPlus, X
} from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '../../../components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Empty } from '../../../components/ui/empty';
import { Patient, DeclarationStatus } from '../../../types';
import { getRiskLevelLabel, getRiskLevelVariant } from '../../../lib/status-helpers';
import { getDeclarationStatusConfig } from './patient-list-helpers';

export type PatientTableProps = {
  patients: Patient[];
  loading: boolean;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  hasActiveFilters: boolean;
  onNavigate: (path: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onOpenHealthDeclaration: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onClearFilters: () => void;
  onAddPatient: () => void;
};

export function PatientTable({
  patients,
  loading,
  isSelectionMode,
  selectedIds,
  hasActiveFilters,
  onNavigate,
  onToggleSelectAll,
  onToggleSelect,
  onOpenHealthDeclaration,
  onDeletePatient,
  onClearFilters,
  onAddPatient,
}: PatientTableProps) {
  return (
    <Card className="overflow-hidden hidden md:block">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
          <tr>
            {isSelectionMode && (
              <th className="px-4 py-4 w-12">
                <button
                  onClick={onToggleSelectAll}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  aria-label={selectedIds.size === patients.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                >
                  {selectedIds.size === patients.length && patients.length > 0 ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
            )}
            <th className="px-6 py-4">שם המטופל</th>
            <th className="px-6 py-4">טלפון</th>
            <th className="px-6 py-4">ביקור אחרון</th>
            <th className="px-6 py-4">הצהרת בריאות</th>
            <th className="px-6 py-4">רמת סיכון</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* Loading skeleton */}
          {loading && (
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
          {/* Empty state */}
          {!loading && patients.length === 0 && (
            <tr>
              <td colSpan={isSelectionMode ? 7 : 6} className="py-12">
                <Empty
                  icon={hasActiveFilters ? <Search className="h-6 w-6 text-muted-foreground" /> : <Users className="h-6 w-6 text-muted-foreground" />}
                  title={hasActiveFilters ? 'לא נמצאו תוצאות' : 'אין מטופלים'}
                  description={hasActiveFilters ? 'נסה לשנות את מסנני החיפוש' : 'הוסף מטופל חדש כדי להתחיל'}
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" className="gap-2" onClick={onClearFilters}>
                        נקה סינון <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button className="gap-2" onClick={onAddPatient}>
                        הוסף מטופל <UserPlus className="h-4 w-4" />
                      </Button>
                    )
                  }
                />
              </td>
            </tr>
          )}
          {!loading && patients.length > 0 && patients.map(patient => (
            <tr
              key={patient.id}
              className={`hover:bg-primary/5 transition-all cursor-pointer group border-r-2 border-r-transparent hover:border-r-primary ${
                selectedIds.has(patient.id) ? 'bg-primary/10' : ''
              }`}
              onClick={() => !isSelectionMode && onNavigate(`/admin/patients/${patient.id}`)}
            >
              {isSelectionMode && (
                <td className="px-4 py-4">
                  <button
                    onClick={(e) => onToggleSelect(patient.id, e)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={selectedIds.has(patient.id) ? 'בטל בחירה' : 'בחר'}
                  >
                    {selectedIds.has(patient.id) ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </td>
              )}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500">{patient.phone}</td>
              <td className="px-6 py-4 text-gray-500">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('he-IL') : '-'}</td>
              <td className="px-6 py-4">
                {(() => {
                  const config = getDeclarationStatusConfig(patient.declarationStatus);
                  const StatusIcon = config.icon;
                  return (
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon size={12} />
                        {config.label}
                      </Badge>
                      {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHealthDeclaration(patient);
                          }}
                        >
                          שלח <Send size={12} />
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <Badge variant={getRiskLevelVariant(patient.riskLevel)}>
                  {getRiskLevelLabel(patient.riskLevel)}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="פעולות" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="gap-2" onClick={() => onNavigate(`/admin/patients/${patient.id}`)}>
                      צפייה בפרופיל <Eye className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => onNavigate(`/admin/patients/${patient.id}?tab=appointments`)}>
                      קביעת תור <Calendar className="h-4 w-4" />
                    </DropdownMenuItem>
                    {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
                      <DropdownMenuItem className="gap-2" onClick={() => onOpenHealthDeclaration(patient)}>
                        שלח הצהרת בריאות <FileHeart className="h-4 w-4" />
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 gap-2"
                      onClick={() => onDeletePatient(patient)}
                    >
                      מחיקה <Trash2 className="h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
