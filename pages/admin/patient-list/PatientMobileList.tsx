import React from 'react';
import { Search, CheckSquare, Square, Send, Users, UserPlus, X } from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '../../../components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Empty } from '../../../components/ui/empty';
import { Patient } from '../../../types';
import { getRiskLevelLabel, getRiskLevelVariant } from '../../../lib/status-helpers';
import { getDeclarationStatusConfig } from './patient-list-helpers';

export type PatientMobileListProps = {
  patients: Patient[];
  loading: boolean;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  hasActiveFilters: boolean;
  onNavigate: (path: string) => void;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onOpenHealthDeclaration: (patient: Patient) => void;
  onClearFilters: () => void;
  onAddPatient: () => void;
};

export function PatientMobileList({
  patients,
  loading,
  isSelectionMode,
  selectedIds,
  hasActiveFilters,
  onNavigate,
  onToggleSelect,
  onOpenHealthDeclaration,
  onClearFilters,
  onAddPatient,
}: PatientMobileListProps) {
  return (
    <div className="md:hidden space-y-4">
      {/* Mobile loading skeleton */}
      {loading && (
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
      {/* Mobile Empty state */}
      {!loading && patients.length === 0 && (
        <Card className="p-8">
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
        </Card>
      )}
      {!loading && patients.length > 0 && patients.map(patient => (
        <Card
          key={patient.id}
          className={`p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-all touch-manipulation hover:shadow-lg border-r-2 border-r-transparent hover:border-r-primary ${
            selectedIds.has(patient.id) ? 'bg-primary/10 border-r-primary' : ''
          }`}
          onClick={() => !isSelectionMode && onNavigate(`/admin/patients/${patient.id}`)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {isSelectionMode && (
                <button
                  onClick={(e) => onToggleSelect(patient.id, e)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  aria-label={selectedIds.has(patient.id) ? 'בטל בחירה' : 'בחר'}
                >
                  {selectedIds.has(patient.id) ? (
                    <CheckSquare size={22} className="text-primary" />
                  ) : (
                    <Square size={22} />
                  )}
                </button>
              )}
              <Avatar className="w-12 h-12">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-gray-900">{patient.name}</div>
                <div className="text-sm text-gray-600">{patient.phone}</div>
              </div>
            </div>
            <Badge variant={getRiskLevelVariant(patient.riskLevel)}>
              {getRiskLevelLabel(patient.riskLevel)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
            <div>
              <span className="text-gray-600 block text-xs">ביקור אחרון</span>
              {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('he-IL') : '-'}
            </div>
            <div>
              <span className="text-gray-600 block text-xs">הצהרת בריאות</span>
              {(() => {
                const config = getDeclarationStatusConfig(patient.declarationStatus);
                const StatusIcon = config.icon;
                return (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={config.variant} className="gap-1 text-xs">
                      <StatusIcon size={10} />
                      {config.label}
                    </Badge>
                  </div>
                );
              })()}
            </div>
          </div>
          {(patient.declarationStatus === 'none' || patient.declarationStatus === 'expired') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onOpenHealthDeclaration(patient);
              }}
            >
              שלח הצהרת בריאות <Send size={14} />
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
